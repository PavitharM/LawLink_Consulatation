#!/usr/bin/env bash
# One-shot local setup for LawLink: installs deps, creates env files, migrates and seeds MySQL.
# Safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bold() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m!! %s\033[0m\n' "$*"; }
die()  { printf '\033[31mxx %s\033[0m\n' "$*"; exit 1; }

bold "Checking prerequisites"
command -v node >/dev/null || die "Node.js is not installed (need >= 20). https://nodejs.org"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || die "Node $(node -v) is too old; need >= 20"
echo "node $(node -v), npm $(npm -v)"

bold "Installing dependencies (root, backend, frontend, mobile)"
npm install
for app in backend frontend mobile; do
  echo "-- $app"
  npm --prefix "$app" install
done

bold "Creating env files"
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  if command -v openssl >/dev/null; then
    sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|; s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(openssl rand -hex 32)|" backend/.env
    rm -f backend/.env.bak
  fi
  echo "created backend/.env (random JWT secrets). Check DATABASE_URL matches your MySQL."
else
  echo "backend/.env exists, leaving it alone"
fi
if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "created frontend/.env"
else
  echo "frontend/.env exists, leaving it alone"
fi

bold "Preparing the database"
# migrate deploy creates the database if it doesn't exist yet
if ! (cd backend && npx prisma migrate deploy); then
  warn "Could not reach MySQL using DATABASE_URL in backend/.env."
  warn "Either start your local MySQL (brew services start mysql)"
  warn "or run 'npm run db:up' and set DATABASE_URL=\"mysql://root:lawlink@127.0.0.1:3307/lawlink\","
  warn "then re-run: npm run setup"
  exit 1
fi
(cd backend && npx prisma generate)
npm --prefix backend run seed

bold "Done"
cat <<'MSG'
Start everything:        npm run dev            (API :5001, web :5173, Expo :8081)
Backend + web only:      npm run dev:web-only
Admin login:             admin@lawlink.in / admin123
MSG
