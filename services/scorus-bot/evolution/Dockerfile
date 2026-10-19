ARG EVOLUTION_BASE=evoapicloud/evolution-api:v2.3.7
FROM ${EVOLUTION_BASE}
COPY services/scorus-bot/evolution/scorus-album.cjs /evolution/scorus-album.cjs
COPY services/scorus-bot/evolution/patch_album.cjs /evolution/patch_album.cjs
COPY src/data/scorus-team.json /evolution/scorus-catalog.json
RUN node /evolution/patch_album.cjs && node --check /evolution/dist/main.js
