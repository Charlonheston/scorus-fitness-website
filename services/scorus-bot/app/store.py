import os
import time
import uuid
from sqlalchemy import JSON, Boolean, Float, Integer, String, Text, create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./scorus.db')
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {})
Session = sessionmaker(engine, expire_on_commit=False)

def uid():
    return str(uuid.uuid4())

class Base(DeclarativeBase):
    pass

class Lead(Base):
    __tablename__ = 'leads'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uid)
    phone: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, default='')
    profile: Mapped[dict] = mapped_column(JSON, default=dict)
    attribution: Mapped[dict] = mapped_column(JSON, default=dict)
    consent: Mapped[dict] = mapped_column(JSON, default=dict)
    language: Mapped[str] = mapped_column(String, default='es')
    state: Mapped[str] = mapped_column(String, default='new')
    paused: Mapped[bool] = mapped_column(Boolean, default=False)
    opted_out: Mapped[bool] = mapped_column(Boolean, default=False)
    last_inbound: Mapped[float] = mapped_column(Float, default=0)
    generation: Mapped[int] = mapped_column(Integer, default=0)
    followups: Mapped[int] = mapped_column(Integer, default=0)
    created: Mapped[float] = mapped_column(Float, default=time.time)

class Record(Base):
    __tablename__ = 'records'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uid)
    kind: Mapped[str] = mapped_column(String, index=True)
    lead_id: Mapped[str] = mapped_column(String, default='', index=True)
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    created: Mapped[float] = mapped_column(Float, default=time.time)

class Job(Base):
    __tablename__ = 'jobs'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uid)
    key: Mapped[str] = mapped_column(String, unique=True)
    kind: Mapped[str] = mapped_column(String, index=True)
    lead_id: Mapped[str] = mapped_column(String, default='')
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    due: Mapped[float] = mapped_column(Float, default=time.time, index=True)
    status: Mapped[str] = mapped_column(String, default='pending', index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str] = mapped_column(String, default='')
    owner: Mapped[str] = mapped_column(String, default='')
    lease_until: Mapped[float] = mapped_column(Float, default=0)

class Config(Base):
    __tablename__ = 'configuration'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    data: Mapped[dict] = mapped_column(JSON)

def init():
    Base.metadata.create_all(engine)
    # Additive migration: preserve the existing queue and customer records.
    with engine.begin() as conn:
        if engine.dialect.name=='postgresql':
            conn.execute(text('SELECT pg_advisory_xact_lock(428006)'))
        columns={c['name'] for c in inspect(conn).get_columns('jobs')}
        for name, definition in [('owner', "VARCHAR NOT NULL DEFAULT ''"), ('lease_until', 'DOUBLE PRECISION NOT NULL DEFAULT 0')]:
            if name not in columns: conn.execute(text(f'ALTER TABLE jobs ADD COLUMN {name} {definition}'))
    with Session.begin() as db:
        if not db.get(Config, 'settings'):
            db.add(Config(id='settings', data={'mode':'test','launch_approved':False,'catalog_approved':['core-6'],'terms_url':'','privacy_url':'','terms_version':'','billing_approved':False,'harbiz_procedure_approved':False,'templates_approved':False,'public_form_enabled':False,'capacity':10,'event_types':{},'template_names':{},'published_blocks':[],'test_recipients':[],'test_allow_inbound_any':False}))
        else:
            cfg=db.get(Config,'settings')
            if 'test_allow_inbound_any' not in cfg.data:
                cfg.data={**cfg.data,'test_allow_inbound_any':False}
            mode=os.getenv('SCORUS_MODE','test')
            if cfg.data['mode']!=mode:
                cfg.data={**cfg.data,'mode':mode,'launch_approved':False,'public_form_enabled':False}
        from .queueing import DEFAULT_PACING
        cfg=db.get(Config,'settings')
        cfg.data={**cfg.data,'pacing':{**DEFAULT_PACING,**cfg.data.get('pacing',{})}}
        if not db.get(Config,'delivery'):
            db.add(Config(id='delivery',data={'connection':'unknown','connected_since':0,'last_send':0,'contacts':{},'attempts':[],'failures':[],'pause_until':0,'restricted':False,'typing_job':''}))
        # Legacy history was not marked as answered. Do not replay old questions.
        for lead in db.query(Lead):
            records=db.query(Record).filter_by(kind='message',lead_id=lead.id).all()
            last_out=max((r.created for r in records if r.data.get('direction')=='out'),default=0)
            for rec in records:
                if rec.data.get('direction')=='in' and 'answered' not in rec.data:
                    rec.data={**rec.data,'answered':rec.created<=last_out}

def add_record(db, kind, lead_id, data):
    rec = Record(kind=kind, lead_id=lead_id, data=data)
    db.add(rec)
    return rec

def enqueue(db, key, kind, lead_id, data, due=None):
    existing = db.query(Job).filter_by(key=key).first()
    if existing:
        return existing
    job = Job(key=key, kind=kind, lead_id=lead_id, data=data, due=time.time() if due is None else due)
    db.add(job)
    return job
