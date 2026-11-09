# LawLink

| App        | Folder      | Stack                                   | Local URL               |
| ---------- | ----------- | --------------------------------------- | ----------------------- |
| API        | `backend/`  | Express 5 + TypeScript, Prisma, MySQL   | http://localhost:5001   |
| Web app    | `frontend/` | React 19 + Vite + Tailwind              | http://localhost:5173   |
| Mobile app | `mobile/`   | Expo SDK 58 + Expo Router               | Metro on :8081          |

## Prerequisites

- **Node.js 20+** and npm
- **MySQL 8+**, one of:
  - Homebrew: `brew install mysql && brew services start mysql` (listens on 3306)
  - Docker: `npm run db:up` (starts MySQL on **3307**, root password `lawlink`)
- For mobile: the **Expo Go** app on your phone (same Wi-Fi as your computer), or Xcode / Android Studio simulators

## First-time setup

```bash
npm run setup
```

This installs dependencies for all apps, creates `backend/.env` (random JWT secrets) and
`frontend/.env` from their `.env.example`, applies the Prisma migrations (creating the `lawlink`
database if needed), and seeds the admin account and default packages. It's safe to re-run.

If MySQL isn't on the default `mysql://root@127.0.0.1:3306/lawlink`, edit `DATABASE_URL` in
`backend/.env` and run `npm run setup` again. Percent-encode special characters in the
password (`@` → `%40`).

## Running

```bash
npm run dev            # API + web + Expo, in one terminal (keys like i / a / r go to Expo)
npm run dev:web-only   # API + web
npm run dev:backend    # each one on its own
npm run dev:web
npm run dev:mobile
```

Log in with **admin@lawlink.in / admin123**. Register client and lawyer accounts from the app.

The mobile app finds the API automatically at `http://<your computer's LAN IP>:5001/api`; see
`mobile/README.md` to point it elsewhere.

## Database

```bash
npm run db:migrate   # apply migrations + regenerate the Prisma client
npm run db:seed      # re-seed (idempotent)
npm run db:studio    # browse data in Prisma Studio
npm run db:reset     # DROP everything, re-migrate and re-seed
```

## Checks

```bash
npm run check        # backend tsc build, web lint, mobile typecheck
```

## Optional config

- Profile-picture uploads use Cloudinary: set `CLOUDINARY_*` in `backend/.env`. Other uploads are
  stored in `backend/uploads/`.
- `CLIENT_URL` in `backend/.env` is the comma-separated list of browser origins allowed by CORS.
