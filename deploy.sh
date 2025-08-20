#!/usr/bin/env bash
set -euo pipefail

SERVER="root@198.199.123.92"
REMOTE_DIR="/opt/yap-integration"

MODE="${1:-all}"  # all | frontend | backend

case "$MODE" in
  frontend)
    ssh "$SERVER" "mkdir -p '$REMOTE_DIR/frontend'"
    rsync -az --delete --filter=':- .deployignore' ./frontend/ "$SERVER:$REMOTE_DIR/frontend/"
    ;;
  backend)
    ssh "$SERVER" "mkdir -p '$REMOTE_DIR/backend'"
    rsync -az --delete --filter=':- .deployignore' ./backend/ "$SERVER:$REMOTE_DIR/backend/"
    ;;
  all|*)
    rsync -az --delete --filter=':- .deployignore' ./ "$SERVER:$REMOTE_DIR/"
    ;;
esac

echo "✓ Code synced ($MODE). No remote commands were executed."
