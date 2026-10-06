import os
import time
import uuid
from sqlalchemy import JSON, Boolean, Float, Integer, String, Text, create_engine
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

class Config(Base):
    __tablename__ = 'configuration'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    data: Mapped[dict] = mapped_column(JSON)

def init():
    Base.metadata.create_all(engine)
    with Session.begin() as db:
        if not db.get(Config, 'settings'):
            db.add(Config(id='settings', data={'mode':'test','launch_approved':False,'catalog_approved':['core-6'],'terms_url':'','privacy_url':'','terms_version':'','billing_approved':False,'harbiz_procedure_approved':False,'templates_approved':False,'public_form_enabled':False,'capacity':10,'event_types':{},'template_names':{},'published_blocks':[],'test_recipients':[]}))
        else:
            cfg=db.get(Config,'settings')
            mode=os.getenv('SCORUS_MODE','test')
            if cfg.data['mode']!=mode:
                cfg.data={**cfg.data,'mode':mode,'launch_approved':False,'public_form_enabled':False}

def add_record(db, kind, lead_id, data):
    rec = Record(kind=kind, lead_id=lead_id, data=data)
    db.add(rec)
    return rec

def enqueue(db, key, kind, lead_id, data, due=None):
    existing = db.query(Job).filter_by(key=key).first()
    if existing:
        return existing
    job = Job(key=key, kind=kind, lead_id=lead_id, data=data, due=due or time.time())
    db.add(job)
    return job
