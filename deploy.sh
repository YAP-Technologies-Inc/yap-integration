#!/usr/bin/env bash
set -euo pipefail

SERVER="root@198.199.123.92"
REMOTE_DIR="/opt/yap-integration"

REV="$(git rev-parse --short HEAD || echo manual)"
TS="$(date +%Y%m%d-%H%M%S)"

echo "▶ Syncing code to ${SERVER}:${REMOTE_DIR} (code only)…"
rsync -az --delete --filter=':- .deployignore' ./ "${SERVER}:${REMOTE_DIR}/"

echo "▶ Building & restarting backend/frontend (tagging backups as :prev and timestamp)…"
ssh -T "$SERVER" bash -lc "
  set -e
  cd ${REMOTE_DIR}

  # tag current images as :prev (one-step rollback) and with timestamp
  if docker image inspect yap-integration-frontend:latest >/dev/null 2>&1; then
    docker tag yap-integration-frontend:latest yap-integration-frontend:prev || true
    docker tag yap-integration-frontend:latest yap-integration-frontend:${TS}-${REV} || true
  fi
  if docker image inspect yap-integration-backend:latest >/dev/null 2>&1; then
    docker tag yap-integration-backend:latest yap-integration-backend:prev || true
    docker tag yap-integration-backend:latest yap-integration-backend:${TS}-${REV} || true
  fi

  # build only FE/BE (envs/nginx untouched)
  export DOCKER_BUILDKIT=1
  docker compose build frontend backend

  # also tag new builds with commit for traceability
  if docker image inspect yap-integration-frontend:latest >/dev/null 2>&1; then
    docker tag yap-integration-frontend:latest yap-integration-frontend:${REV} || true
  fi
  if docker image inspect yap-integration-backend:latest >/dev/null 2>&1; then
    docker tag yap-integration-backend:latest yap-integration-backend:${REV} || true
  fi

  # start only FE/BE
  docker compose up -d --no-deps frontend backend

  # run smoke tests; rollback on failure
  echo '▶ Running smoke tests…'
  if ! ./smoke.sh; then
    echo '!! Smoke tests failed — rolling back to :prev images'
    # restore previous images as latest
    if docker image inspect yap-integration-frontend:prev >/dev/null 2>&1; then
      docker tag yap-integration-frontend:prev yap-integration-frontend:latest || true
    fi
    if docker image inspect yap-integration-backend:prev >/dev/null 2>&1; then
      docker tag yap-integration-backend:prev yap-integration-backend:latest || true
    fi
    docker compose up -d --force-recreate --no-deps frontend backend
    echo '↩️  Rolled back to previous images.'
    exit 1
  fi

  echo 'Deploy + smoke OK.'
  docker compose ps
"

echo "Deploy complete: ${REV}"
