#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Backend dev setup started"

echo "1) Installing dependencies (this may take a minute)..."
npm install

echo "2) Generating Prisma client"
npx prisma generate

echo "3) Attempting to introspect DB (npx prisma db pull)"
if npx prisma db pull; then
  echo "✅ Introspection succeeded"
else
  echo "⚠️ prisma db pull failed — continuing. If this is a network/auth error, check DATABASE_URL in .env"
fi

echo "4) Applying migrations (npx prisma migrate deploy)"
if npx prisma migrate deploy; then
  echo "✅ Migrations applied"
else
  echo "⚠️ migrate deploy failed. You can run 'npx prisma migrate deploy' manually after inspecting errors"
fi

echo "5) Starting backend (npm run dev) on PORT=5001. Use Ctrl+C to stop."
# Start with port 5001 to avoid macOS services that commonly use 5000
PORT=5001 npm run dev
