from .store import Job, Lead, Record

def snapshot(db):
    bookings=db.query(Record).filter_by(kind='booking').all()
    contracts=db.query(Record).filter_by(kind='contract').all()
    tasks=db.query(Record).filter_by(kind='task').all()
    usages=db.query(Record).filter_by(kind='usage').all()
    valuations=[r for r in bookings if r.data.get('type')=='valuation']
    samples=[]; pending={}
    messages=db.query(Record).filter_by(kind='message').order_by(Record.created.desc()).limit(1000).all()
    for record in reversed(messages):
        if record.data.get('direction')=='in': pending.setdefault(record.lead_id,record.created)
        elif record.lead_id in pending: samples.append(max(0,record.created-pending.pop(record.lead_id)))
    known=[r.data.get('tokens',{}) for r in usages if r.data.get('tokens',{}).get('cost_status') not in (None,'unknown')]
    return {'leads':db.query(Lead).count(),'valuations':len(valuations),'attended':sum(r.data.get('status')=='completed' for r in valuations),
            'contracts':sum(r.data.get('status') in ('paid','active','ended') for r in contracts),
            'onboarding_pending':sum(r.data.get('type')=='harbiz' and r.data.get('status')=='open' for r in tasks),
            'human':db.query(Lead).filter_by(paused=True).count(),
            'incidents':db.query(Record).filter_by(kind='alert').count()+db.query(Job).filter(Job.status.in_(['failed','review'])).count(),
            'response_seconds':sum(samples)/len(samples) if samples else None,'response_samples':len(samples),
            'model_tokens':sum(r.data.get('tokens',{}).get('total_tokens',0) or 0 for r in usages),
            'estimated_model_cost_usd':sum(u.get('estimated_cost_usd',0) or 0 for u in known) if known else None,
            'cost_complete':bool(usages) and len(known)==len(usages)}
