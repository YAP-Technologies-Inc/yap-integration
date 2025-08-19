#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
compose="$here/docker-compose.yml"

cleanup() {
  # Skip cleanup if you want to inspect containers locally:
  #   NO_CLEAN=1 ./pre-prod-test/scripts/run.sh
  if [[ "${NO_CLEAN:-}" = "1" ]]; then
    echo "⚠️  Skipping cleanup because NO_CLEAN=1"
    return
  fi
  echo "▶ Cleaning up (containers, volumes, images, cache)…"
  "$here/scripts/down.sh" --deep || true
}

# Always cleanup on exit (pass or fail)
trap 'status=$?;
      if [[ $status -eq 0 ]]; then
        echo "----- Local pre-prod test PASSED. -----"
      else
        echo "----- Local pre-prod test FAILED (exit $status). -----"
      fi
      cleanup
      exit $status' EXIT

# Ensure Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running (start Docker Desktop or 'colima start')."
  exit 1
fi

export DOCKER_BUILDKIT=1

echo "▶ Build images (backend, frontend)…"
docker compose -f "$compose" build backend frontend

echo "▶ Start stack (db, backend, frontend)…"
docker compose -f "$compose" up -d

# Wait for DB to accept connections
echo "▶ Waiting for DB…"
for i in {1..30}; do
  if docker compose -f "$compose" exec -T db pg_isready -U yapuser -d yapdb >/dev/null 2>&1; then
    echo "✓ DB ready"
    break
  fi
  sleep 1
  [[ $i -eq 30 ]] && { echo "DB not ready in time"; exit 1; }
done

# Apply schema every run (idempotent)
"$here/scripts/apply-schema.sh"

# Wait for FE & API to respond
echo "▶ Waiting for FE/API…"
for i in {1..60}; do
  be=$(curl -sk -o /dev/null -w "%{http_code}" http://localhost:4001/api/health || true)

  # try FE /health first; if not 200, try /
  fe=$(curl -sk -o /dev/null -w "%{http_code}" http://localhost:3001/health || true)
  if [[ "$fe" != "200" ]]; then
    fe=$(curl -sk -o /dev/null -w "%{http_code}" http://localhost:3001/ || true)
  fi

  echo "… FE=$fe API=$be"
  if [[ "$fe" = "200" && "$be" = "200" ]]; then
    echo "✓ FE/API healthy"
    break
  fi

  sleep 1
  [[ $i -eq 60 ]] && { echo "FE/API not healthy in time"; exit 1; }
done

echo "▶ Running smoke…"
"$here/scripts/smoke.sh"

echo "FE:  http://localhost:3001"
echo "API: http://localhost:4001"
