"""Commercial authority and explicit acceptance, independent of the language model."""
import os
import re
import time
from .domain import CATALOG, DAY, PROGRAMS, handoff, latest_contract, require, settings
from .store import Record, add_record

QUALIFICATION = ('goal', 'experience', 'days', 'duration', 'location', 'timing')
HUMAN_CATEGORIES = ('professional', 'billing_dispute', 'contract_exception', 'customer_request', 'technical_incident')


def readiness(db):
    cfg = settings(db)
    return {
        'sales_mode': cfg.get('sales_mode', 'autonomous'),
        'approved_programs': cfg['catalog_approved'],
        'checkout_ready': bool(os.getenv('STRIPE_SECRET_KEY') and cfg['billing_approved'] and cfg['terms_url'] and cfg['terms_version']),
        'calendar_ready': bool(os.getenv('CALENDLY_TOKEN') and cfg['event_types'] and cfg['published_blocks']),
        'terms_url': cfg['terms_url'],
        'valuation_required': cfg.get('sales_mode', 'autonomous') == 'valuation',
    }


def last_input(db, lead):
    rows = db.query(Record).filter_by(kind='message', lead_id=lead.id).order_by(Record.created.desc()).all()
    return next((r for r in rows if r.data.get('direction') == 'in'), None)


def health_concern(text):
    # A negated history or a question about product coverage is not a medical case.
    text = re.sub(r'\b(?:no tengo(?: ninguna?)?|sin|no sufro|no presento)\s+(?:lesi[oó]n\w*|dolor|diabet\w*|hipertensi[oó]n|cardiopat\w*)(?:\s+ni\s+(?:lesi[oó]n\w*|dolor))?|\b(?:no injuries|no pain|nem fáj)\b', '', text, flags=re.I)
    return bool(re.search(r'\b(tengo|sufro|padezco|estoy|tomo|i have|i am|i take)\b[^.!?\n]{0,65}\b(lesi[oó]n\w*|dolor|embaraz\w*|medicaci[oó]n|injur\w*|pregnan\w*|diabet\w*|hipertensi[oó]n|cardiopat\w*|enfermedad renal|trastorno aliment\w*)|\b(me duele\w*|me han operado|no puedo respirar|he perdido el conocimiento|me voy a desmayar|can.t breathe|fájdalom|fáj a)\b', text, re.I))


def flag_health(db, lead, text):
    if not health_concern(text) or lead.profile.get('professional_review_required'):
        return
    lead.profile = {**lead.profile, 'professional_review_required': True}
    add_record(db, 'task', lead.id, {'type': 'professional_review', 'status': 'open', 'reason': 'El cliente indica una limitación de salud. Revisar aptitud antes de contratar; el asistente puede seguir explicando el servicio.'})


def request_review(db, lead, category, reason):
    require(category in HUMAN_CATEGORIES, 'Tipo de intervención no permitido.')
    incoming = last_input(db, lead)
    text = incoming.data.get('text', '') if incoming else ''
    patterns = {
        'professional': r'(qu[eé] ejercicios? (?:debo|puedo|me)|c[oó]mo (?:hago|ejecuto|corrijo).{0,30}(?:ejercicio|sentadilla|peso muerto|press|t[eé]cnica)|corrige (?:mi|este)|ajusta (?:mi|el)|(?:hazme|dame|dime|prescribe).{0,35}(?:dieta|rutina|calor[ií]as|tratamiento|plan de entrenamiento)|cu[aá]ntas? (?:calor[ií]as|prote[ií]nas)|qu[eé].{0,20}(?:debo|deber[ií]a).{0,20}(?:comer|cenar|desayunar)|(?:what exercises|how do i (?:do|perform).{0,25}(?:exercise|squat|deadlift|press)|prescribe|adjust my|give me a diet|how many calories|what should i eat)|(?:mit egyek|hány kalória))',
        'billing_dispute': r'(quiero|solicito|necesito|pido).{0,35}(?:reembolso|devoluci[oó]n)|devu[eé]lv|(?:cobrado|cargo).{0,35}(?:doble|dos veces|incorrecto)|(?:refund my|i want a refund|charged twice)|visszatérítést kérek',
        'contract_exception': r'(quiero|necesito|pod[eé]is|puedes|solicito).{0,35}(?:descuento|cancelar|pausar|cambiar.{0,10}contrato)|(?:cancel my|pause my|can i get a discount)|szerződés.{0,20}lemond',
        'customer_request': r'(?:p[aá]same|quiero hablar|hablar directamente|que me atienda|talk to|speak to|connect me to).{0,35}(?:bernat|persona|humano|human|person)|(?:quiero|necesito).{0,15}(?:a bernat|una persona)|beszélni.{0,15}bernattal',
    }
    if category == 'technical_incident':
        # Missing setup is an operational task; it must not silence product questions.
        for rec in db.query(Record).filter_by(kind='operation', lead_id=lead.id):
            if rec.data.get('status') == 'pending':
                handoff(db, lead, 'Operación pendiente de verificar; evitar duplicados.')
                return {'handed_off': True, 'category': category}
        key = 'technical-review:' + lead.id
        if not db.get(Record, key):
            db.add(Record(id=key, kind='alert', lead_id=lead.id, data={'reason': reason[:500], 'type': 'setup', 'status': 'open'}))
        return {'handed_off': False, 'status': 'setup_pending', 'next_action': 'Explica qué gestión está pendiente y continúa atendiendo las preguntas comerciales. No confirmes una operación que no se ha realizado.'}
    allowed = bool(re.search(patterns[category], text, re.I))
    if category == 'professional':
        allowed = allowed or health_concern(text)
    if not allowed:
        add_record(db, 'audit', lead.id, {'action': 'handoff_declined', 'category': category})
        return {'handed_off': False, 'status': 'within_commercial_scope', 'next_action': 'Explica Core y Elite y recomienda según el apoyo deseado. Dudar de cómo se entrena o pedir información, precio, material o encaje no requiere derivación.'}
    handoff(db, lead, reason[:500])
    return {'handed_off': True, 'category': category}


def qualify(lead):
    require(lead.consent.get('adult') is True, 'Confirma primero que tienes 18 años o más.')
    missing = [k for k in QUALIFICATION if not lead.profile.get(k)]
    require(not missing, 'Faltan datos de cualificación: ' + ', '.join(missing) + '. Pregunta solo lo que falta y continúa la conversación.')
    require(not lead.profile.get('professional_review_required'), 'La aptitud necesita revisión profesional antes del cobro. Puedes seguir explicando los programas; no preparar pago todavía.')


def quote_text(offer, language='es'):
    tier = PROGRAMS[offer['program']]['tier'].title()
    months = offer['months']
    total = f"{offer['total_cents']/100:g}"
    monthly = f"{offer['monthly_cents']/100:g}"
    url = offer['terms_url']
    if language == 'en':
        payment = f'{months} monthly payments of €{monthly}' if offer['payment_mode']=='installments' else f'a single payment of €{total}'
        return f'{tier} for {months} months: total €{total}, VAT included, with {payment}. The programme starts when Bernat activates your personalised plan; renewal is manual. Terms: {url}\nWould you like me to prepare the payment link for this offer?'
    if language == 'hu':
        payment = f'{months} havi részlet, egyenként {monthly} €' if offer['payment_mode']=='installments' else f'egyszeri {total} € fizetés'
        return f'{tier}, {months} hónap: összesen {total} €, áfával, {payment}. A program Bernat személyre szabott tervének aktiválásával indul; a megújítás külön elfogadást igényel. Feltételek: {url}\nElőkészítsem ennek az ajánlatnak a fizetési linkjét?'
    payment = f'{months} cuotas mensuales de {monthly} €' if offer['payment_mode']=='installments' else f'un pago completo de {total} €'
    return f'{tier} de {months} meses: compromiso total de {total} €, IVA incluido, con {payment}. El programa empieza cuando Bernat activa tu plan personalizado; la renovación es manual. Condiciones: {url}\n¿Quieres que prepare el enlace de pago de esta oferta?'


def offer_summary(db, lead, program_id, payment_mode, confirmed, source_turn):
    cfg = settings(db)
    require(program_id in PROGRAMS, 'Programa desconocido.')
    require(payment_mode in ('full', 'installments'), 'Modalidad de pago desconocida.')
    program = PROGRAMS[program_id]
    summary = {'program': program_id, 'catalog_version': CATALOG['version'], 'monthly_cents': program['monthly_cents'], 'total_cents': program['total_cents'], 'months': program['months'], 'payment_mode': payment_mode, 'renewal': 'manual', 'service_start': 'Activación del plan personalizado por Bernat', 'terms_url': cfg['terms_url']}
    if program_id not in cfg['catalog_approved']:
        return {'status': 'tariff_pending', 'offer': summary, 'next_action': 'Esta tarifa es provisional. Explica la diferencia y ofrece Core 6 como alternativa confirmada; no cobrar esta modalidad.'}, None
    if not readiness(db)['checkout_ready']:
        key = 'checkout-setup:' + lead.id
        if not db.get(Record, key):
            db.add(Record(id=key, kind='alert', lead_id=lead.id, data={'type': 'setup', 'status': 'open', 'reason': 'Checkout pendiente: conectar Stripe y validar condiciones y facturación. La conversación comercial continúa.'}))
        return {'status': 'configuration_pending', 'offer': summary, 'next_action': 'Explica el importe y las condiciones conocidas. El enlace de pago aún no está habilitado; no inventes cobro ni reserva y no pauses la conversación.'}, None
    qualify(lead)
    offers = db.query(Record).filter_by(kind='sales_offer', lead_id=lead.id).order_by(Record.created.desc()).all()
    offer = next((r for r in offers if r.data.get('program') == program_id and r.data.get('catalog_version') == CATALOG['version'] and r.data.get('payment_mode') == payment_mode and r.data.get('terms_version') == cfg['terms_version'] and r.data.get('expires_at', 0) > time.time() and r.data.get('delivered_at')), None)
    if confirmed and offer:
        existing=latest_contract(db,lead)
        if offer.data.get('accepted_at') and existing and existing.data.get('status') in ('held','checkout') and existing.data.get('hold_until',0)>time.time() and existing.data.get('program')==program_id and existing.data.get('payment_mode')==payment_mode:
            return None,offer
        incoming = last_input(db, lead)
        affirmation = r'^\s*(s[ií]|yes|igen|ok|vale|adelante|de acuerdo|confirmo|acepto)\b|(?:quiero|vamos a).{0,20}(?:contratar|pagar|empezar)|(?:c[oó]mo (?:pago|contrato)|env[ií]a(?:me)?.{0,20}(?:enlace|link).{0,15}pago)|(?:i want to (?:pay|join)|send me the payment|let.s proceed)|(?:szeretnék fizetni)'
        require(incoming is not None and incoming.created > offer.data['delivered_at'] and re.search(affirmation, incoming.data.get('text', ''), re.I) and not re.search(r'\b(?:no quiero|no acepto|no confirmo|no contratar|don.t want|do not|not now|nem kérem|pero|but|a condici[oó]n|con descuento)\b', incoming.data.get('text', ''), re.I), 'El cliente debe aceptar expresamente esta oferta después de recibirla. Pide confirmación; no asumirla.')
        offer.data = {**offer.data, 'accepted_at': offer.data.get('accepted_at') or time.time(), 'accepted_message': incoming.id}
        lead.profile = {**lead.profile, 'approved_program': program_id, 'approved_at': offer.data['accepted_at'], 'approved_by': 'autonomous_sales', 'accepted_offer': offer.id}
        lead.state = 'approved'
        add_record(db, 'audit', lead.id, {'action': 'sale_accepted', 'program': program_id, 'offer_id': offer.id, 'inbound_id': incoming.id})
        return None, offer
    # An offer is not a capacity reservation. It becomes eligible only when actually sent.
    offer = add_record(db, 'sales_offer', lead.id, {**summary, 'terms_version': cfg['terms_version'], 'expires_at': time.time() + DAY, 'source_turn': source_turn, 'delivered_at': None})
    db.flush()
    return {'status': 'needs_confirmation', 'offer_id': offer.id, 'offer': summary, 'customer_text': quote_text(summary,lead.language), 'next_action': 'Comunica la oferta exacta. Espera una nueva aceptación explícita antes de preparar checkout.'}, offer
