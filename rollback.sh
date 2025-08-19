#!/usr/bin/env bash
set -euo pipefail
SERVER="root@157.230.214.76"
REMOTE_DIR="/opt/yap-integration"

TARGET_TAG="${1:-prev}"  # use 'prev' by default, or pass a specific tag like 20250819-175000-ab12cd3

ssh -T "$SERVER" bash -lc "
  set -e
  cd ${REMOTE_DIR}

  echo '↩️  Rolling FE/BE back to tag: ${TARGET_TAG}'

  if ! docker image inspect yap-integration-frontend:${TARGET_TAG} >/dev/null 2>&1; then
    echo 'Frontend tag not found: yap-integration-frontend:${TARGET_TAG}'; exit 1
  fi
  if ! docker image inspect yap-integration-backend:${TARGET_TAG} >/dev/null 2>&1; then
    echo 'Backend tag not found: yap-integration-backend:${TARGET_TAG}'; exit 1
  fi

  # point latest back to the chosen tag
  docker tag yap-integration-frontend:${TARGET_TAG} yap-integration-frontend:latest
  docker tag yap-integration-backend:${TARGET_TAG} yap-integration-backend:latest

  docker compose up -d --force-recreate --no-deps frontend backend

  echo '▶ Verifying after rollback…'
  ./smoke.sh
  echo 'Rollback OK.'
"
