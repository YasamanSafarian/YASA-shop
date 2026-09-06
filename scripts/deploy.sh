#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${DEPLOY_BRANCH:-main}"
BACKEND_LOG="/tmp/yasa-backend.log"
ENV_FILE="$ROOT/backend/.env"

die() { echo "ERROR: $*" >&2; exit 1; }
warn() { echo "WARNING: $*" >&2; }

cd "$ROOT"
[ -f docker-compose.yml ] || die "not the repo root (docker-compose.yml not found)"

for bin in git node npm docker; do
  command -v "$bin" >/dev/null || die "'$bin' is not installed on this server"
done

echo "==> Pulling latest code (branch: $BRANCH)"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Starting Postgres via Docker"
if docker compose version >/dev/null 2>&1; then
  docker compose up -d
else
  docker-compose up -d
fi

echo "==> Waiting for Postgres to accept connections"
for i in $(seq 1 30); do
  if docker exec perfume-postgres pg_isready -U perfume -d perfume_shop >/dev/null 2>&1; then
    break
  fi
  [ "$i" -eq 30 ] && die "Postgres did not become ready; run: docker compose logs postgres"
  sleep 2
done

if [ ! -f "$ENV_FILE" ]; then
  echo "==> Creating backend/.env from example"
  cp "$ROOT/backend/.env.example" "$ENV_FILE"
fi

if grep -q 'change-me' "$ENV_FILE"; then
  echo "==> Generating fresh JWT secrets"
  ACCESS="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
  REFRESH="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
  sed -i "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=\"$ACCESS\"|" "$ENV_FILE"
  sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=\"$REFRESH\"|" "$ENV_FILE"
fi

if ! grep -q '^MROTP_API_KEY=.\+' "$ENV_FILE"; then
  warn "MROTP_API_KEY is not set in $ENV_FILE."
  warn "Registration OTP and forgot-password will fail until you add MROTP_API_KEY=<key>."
fi

mkdir -p "$ROOT/uploads"

echo "==> Backend: install + prisma migrate"
cd "$ROOT/backend"
npm install --no-audit --no-fund
npx prisma generate
npx prisma migrate deploy

echo "==> Backend: build"
npm run build

echo "==> Backend: restart on :3001"
if command -v lsof >/dev/null 2>&1; then
  lsof -ti :3001 | xargs -r kill 2>/dev/null || true
elif command -v fuser >/dev/null 2>&1; then
  fuser -k 3001/tcp 2>/dev/null || true
else
  pkill -f 'node dist/main' 2>/dev/null || true
fi
sleep 1
: > "$BACKEND_LOG"
(setsid node dist/main >> "$BACKEND_LOG" 2>&1 < /dev/null &)

echo "==> Waiting for backend to serve :3001"
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/auth/me || true)"
  if [ "$code" != "000" ] && [ -n "$code" ]; then
    echo "    Backend up (HTTP $code; 401 is expected without a token)"
    break
  fi
  [ "$i" -eq 30 ] && die "Backend did not start; see $BACKEND_LOG"
  sleep 1
done

echo "==> Frontend: install + build"
cd "$ROOT/frontend"
npm install --no-audit --no-fund
npx ng build --configuration production
echo "    Output: $ROOT/frontend/dist/frontend/browser"

echo "==> Verification"
cd "$ROOT/backend"
npx prisma migrate status || warn "prisma reports a migration status issue"

if grep -rqE 'fonts\.gstatic|fonts\.googleapis' "$ROOT/frontend/dist/frontend/browser" 2>/dev/null; then
  warn "built frontend still references Google Fonts"
else
  echo "    Fonts: all self-hosted (no Google Fonts URLs)"
fi

echo "==> Done."
echo "    Static site:  $ROOT/frontend/dist/frontend/browser"
echo "    Backend logs: $BACKEND_LOG"
echo "    Serve the static dir with your reverse proxy; map /api -> 127.0.0.1:3001 and /uploads -> $ROOT/uploads"