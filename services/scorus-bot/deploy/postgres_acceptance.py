"""Test only a newly created isolated database, never the running service DB."""
import os
from sqlalchemy import create_engine,text
from sqlalchemy.engine import make_url
import pytest

url=make_url(os.environ['DATABASE_URL'])
db=create_engine(url,isolation_level='AUTOCOMMIT')
with db.connect() as conn:
    exists=conn.execute(text("SELECT 1 FROM pg_database WHERE datname='scorus_acceptance'")).first()
    if exists:raise RuntimeError('Acceptance DB already exists; inspect it rather than overwrite it.')
    conn.execute(text('CREATE DATABASE scorus_acceptance'))
try:
    os.environ['SCORUS_TEST_DATABASE_URL']=url.set(database='scorus_acceptance').render_as_string(hide_password=False)
    result=pytest.main(['-q','/tests','-p','no:cacheprovider'])
finally:
    # Tests own this DB because its creation above succeeded in this invocation.
    with db.connect() as conn:
        conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='scorus_acceptance' AND pid<>pg_backend_pid()"))
        conn.execute(text('DROP DATABASE scorus_acceptance'))
raise SystemExit(result)
