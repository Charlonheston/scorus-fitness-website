"""Evidence for phone takeovers; a fromMe flag alone does not identify a person."""
import math


def message_timestamp(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, dict):
        low, high = value.get('low'), value.get('high', 0)
        if type(low) is not int or type(high) is not int or high < 0:
            return None
        value = (high << 32) + (low & 0xffffffff)
    try:
        value = float(value)
    except (ValueError, TypeError, OverflowError):
        return None
    if not math.isfinite(value) or value <= 0:
        return None
    if value >= 1e12:
        value /= 1000
    return value if 1e9 <= value < 1e11 else None


def phone_event(item, event, runtime, received_at):
    return {
        'provider_timestamp': message_timestamp(item.get('messageTimestamp')),
        'received_at': received_at,
        'connection_since': runtime.get('connected_since', 0),
        'connection_state': runtime.get('connection', 'unknown'),
        'source': str(item.get('source') or event.get('source') or '').lower()[:40],
        'upsert_type': str(item.get('type') or event.get('type') or '').lower()[:40],
    }


def phone_origin(evidence, runtime):
    if evidence.get('source') == 'api':
        return 'api_echo'
    if evidence.get('upsert_type') == 'append':
        return 'history'
    timestamp = message_timestamp(evidence.get('provider_timestamp'))
    received = evidence.get('received_at', 0)
    connected = evidence.get('connection_since', 0)
    if timestamp is None or not received or timestamp > received + 30:
        return 'unverified'
    # Classify at receipt time, not execution time: the maintenance job can wait.
    if timestamp < received - 300 or (connected and timestamp < connected - 5):
        return 'history'
    if evidence.get('connection_state') != 'open' or not connected:
        return 'unverified'
    # A queued echo from a previous connection cannot take over the new session.
    if runtime.get('connected_since', 0) > connected + 5:
        return 'history'
    return 'manual_live'
