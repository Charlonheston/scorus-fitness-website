FROM node:22-bookworm-slim AS frontend
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN git clone --depth 1 --branch v2026.9.24 https://github.com/NousResearch/hermes-agent.git /hermes && test "$(git -C /hermes rev-parse HEAD)" = f97608f178d1ffeca59860195ab7da295f7c8e5f
WORKDIR /hermes
RUN npm ci --workspace web --workspace ui-tui --include-workspace-root --no-audit --no-fund
RUN NODE_OPTIONS=--max-old-space-size=1024 npm run build --workspace web && npm run build --workspace ui-tui

FROM python:3.12-slim AS hermes-core
RUN apt-get update && apt-get install -y --no-install-recommends git ffmpeg && rm -rf /var/lib/apt/lists/*
RUN git clone --depth 1 --branch v2026.9.24 https://github.com/NousResearch/hermes-agent.git /hermes && test "$(git -C /hermes rev-parse HEAD)" = f97608f178d1ffeca59860195ab7da295f7c8e5f && pip install --no-cache-dir -e '/hermes[mcp,web]'
RUN useradd -u 10002 -m scorus && mkdir -p /home/scorus/.hermes && chown -R scorus:scorus /home/scorus

FROM hermes-core AS dashboard
COPY --from=frontend /usr/local/bin/node /usr/local/bin/node
COPY --from=frontend /hermes/hermes_cli/web_dist /hermes/hermes_cli/web_dist
COPY --from=frontend /hermes/ui-tui/dist /hermes/ui-tui/dist
RUN mkdir -p /home/scorus/.hermes && chown -R scorus:scorus /home/scorus
WORKDIR /runtime
COPY services/scorus-bot/hermes /runtime
COPY src/data/scorus-team.json /runtime/catalog.json
USER scorus
CMD ["python","/runtime/dashboard_init.py"]

FROM hermes-core AS bridge
WORKDIR /runtime
COPY services/scorus-bot/hermes /runtime
COPY src/data/scorus-team.json /runtime/catalog.json
USER scorus
CMD ["uvicorn","bridge:app","--host","0.0.0.0","--port","8642","--no-access-log"]
