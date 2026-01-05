#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Frontend dev setup started"

echo "1) Installing dependencies (this may take a minute)..."
npm install

API_URL=${VITE_API_URL:-http://localhost:5001}
echo "2) Using VITE_API_URL=${API_URL} (export VITE_API_URL to override)"
export VITE_API_URL="$API_URL"

echo "3) Starting frontend dev server (npm run dev). Use Ctrl+C to stop."
npm run dev
