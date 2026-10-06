FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ffmpeg && rm -rf /var/lib/apt/lists/*
RUN git clone --depth 1 --branch v2026.9.24 https://github.com/NousResearch/hermes-agent.git /hermes && pip install --no-cache-dir -e '/hermes[mcp,web]'
RUN useradd -u 10002 -m scorus
WORKDIR /runtime
COPY services/scorus-bot/hermes /runtime
COPY src/data/scorus-team.json /runtime/catalog.json
USER scorus
CMD ["uvicorn","bridge:app","--host","0.0.0.0","--port","8642","--no-access-log"]
