#!/usr/bin/env bash
# Force-restart YASA backend on the VPS (no pm2 required).
# Usage: bash deploy/restart-backend.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
PORT="${PORT:-3001}"
LOG="$ROOT/backend.log"

echo "==> Repo: $ROOT"
echo "==> HEAD: $(git -C "$ROOT" rev-parse --short HEAD) ($(git -C "$ROOT" log -1 --pretty=%s))"

echo "==> Freeing port $PORT"
PIDS="$(ss -lntp 2>/dev/null | awk -v p=":$PORT" '$0 ~ p {while (match($0,/pid=[0-9]+/)) {print substr($0,RSTART+4,RLENGTH-4); $0=substr($0,RSTART+RLENGTH)}}' | sort -u)"
if [ -n "${PIDS:-}" ]; then
  echo "    Found PIDs: $PIDS"
  # shellcheck disable=SC2086
  kill $PIDS 2>/dev/null || true
  sleep 1
  # shellcheck disable=SC2086
  kill -9 $PIDS 2>/dev/null || true
fi
pkill -f "$ROOT/backend/dist/main" 2>/dev/null || true
pkill -f "node dist/main" 2>/dev/null || true
sleep 1

if ss -lntp 2>/dev/null | grep -q ":$PORT"; then
  echo "ERROR: port $PORT still in use:"
  ss -lntp | grep ":$PORT" || true
  exit 1
fi
echo "    Port $PORT is free"

echo "==> Building"
npm run build

if ! grep -q "product-types" dist/health/health.controller.js; then
  echo "ERROR: built dist is missing product-types route. git pull / checkout main first."
  exit 1
fi

echo "==> Starting"
nohup npm run start:prod >"$LOG" 2>&1 &
NEW_PID=$!
echo "    started pid=$NEW_PID"

for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf "http://127.0.0.1:$PORT/health" >/tmp/yasa-health.json 2>/dev/null; then
    break
  fi
  sleep 1
done

echo "==> /health response:"
cat /tmp/yasa-health.json 2>/dev/null || echo "(no response)"
echo
echo "==> /health/product-types response:"
curl -sS "http://127.0.0.1:$PORT/health/product-types" || true
echo
echo "==> Listener on $PORT:"
ss -lntp | grep ":$PORT" || true
echo "==> Last log lines:"
tail -30 "$LOG" || true

if ! grep -q cream_lotion /tmp/yasa-health.json 2>/dev/null; then
  echo
  echo "FAILED: new backend is not serving cream_lotion yet."
  echo "Paste the output above."
  exit 1
fi

echo
echo "OK — backend is on the new build."
