#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
compose="$here/docker-compose.yml"
project_name="pre-prod-test"  # default Compose project is the folder name

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop (or 'colima start')."
  exit 1
fi

echo "▶ Bringing down pre-prod stack (containers, networks, named volumes)…"
docker compose -f "$compose" down -v --remove-orphans || true

# Extra safety: remove any leftover containers with explicit names
for c in preprod-frontend preprod-backend preprod-db; do
  docker rm -f "$c" >/dev/null 2>&1 || true
done

# Remove images built by this compose project
# 1) Whatever compose knows about:
img_ids="$(docker compose -f "$compose" images -q 2>/dev/null | sort -u || true)"
if [[ -n "${img_ids:-}" ]]; then
  echo "▶ Removing compose-built images…"
  echo "$img_ids" | xargs -r docker rmi -f || true
fi

# 2) By repository name (typical for compose builds from this folder)
for ref in "${project_name}-frontend" "${project_name}-backend"; do
  ids="$(docker image ls -q "${ref}:latest" "${ref}:*" 2>/dev/null || true)"
  if [[ -n "${ids:-}" ]]; then
    echo "▶ Removing images matching ${ref}:* …"
    echo "$ids" | xargs -r docker rmi -f || true
  fi
done

# 3) By project label (belt & suspenders; may not always be present on images)
lbl_ids="$(docker image ls -q --filter "label=com.docker.compose.project=${project_name}" 2>/dev/null || true)"
if [[ -n "${lbl_ids:-}" ]]; then
  echo "▶ Removing images labeled with project=${project_name}…"
  echo "$lbl_ids" | xargs -r docker rmi -f || true
fi

# Prune build cache & dangling layers
echo "▶ Pruning dangling layers & build cache…"
docker image prune -f >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true
docker buildx prune -af >/dev/null 2>&1 || true

# Optional FULL nuke (⚠️ removes ALL unused images/containers/networks/volumes)
if [[ "${1:-}" == "--ultra" ]]; then
  echo "ULTRA prune: removing ALL unused Docker resources on this machine…"
  docker system prune -af --volumes || true
fi

echo "----- torn down (including volume & images) -----"
