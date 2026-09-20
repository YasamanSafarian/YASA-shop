#!/usr/bin/env bash
# Rebuild and restart the Nest backend on the VPS after git pull.
# Run from the repo root:  bash deploy/update-backend.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

echo "==> Installing deps"
npm ci

echo "==> Applying DB migrations (adds cream_lotion / gift_box enums)"
npx prisma migrate deploy

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Building backend"
npm run build

echo "==> Restarting backend"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart yasa-backend --update-env || pm2 restart all --update-env
elif command -v systemctl >/dev/null 2>&1 && systemctl list-units --type=service | grep -q yasa; then
  sudo systemctl restart yasa-backend || sudo systemctl restart yasa
else
  echo "No pm2/systemd unit found. Start manually, e.g.:"
  echo "  cd $ROOT/backend && npm run start:prod"
fi

echo "==> Checking allowed product types"
sleep 1
curl -sS "http://127.0.0.1:3001/health/product-types" || true
echo
echo "Done. Expected productTypes to include cream_lotion and gift_box."
