#!/bin/sh
set -eu
cd /opt/scorus-bot/repo/services/scorus-bot
target=/opt/scorus-bot/backups
mkdir -p "$target"
chmod 700 "$target"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
docker compose exec -T db pg_dump -U scorus -d scorus -Fc > "$target/scorus-$stamp.dump"
docker compose exec -T evolution-db pg_dump -U evolution -d evolution -Fc > "$target/evolution-$stamp.dump"
docker compose exec -T evolution tar -czf - -C /evolution instances > "$target/evolution-instances-$stamp.tgz"
tar -czf "$target/config-$stamp.tgz" .env .env.hermes
chmod 600 "$target"/*
find "$target" -maxdepth 1 -type f -mtime +14 -delete
