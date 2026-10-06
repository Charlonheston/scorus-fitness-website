FROM python:3.12-slim
WORKDIR /app
COPY services/scorus-bot/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd -u 10001 -m scorus
COPY services/scorus-bot/app /app/app
COPY services/scorus-bot/panel.html /app/panel.html
COPY src/data/scorus-team.json /app/catalog.json
USER scorus
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","4280","--no-access-log"]
