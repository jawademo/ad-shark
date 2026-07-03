# ad-shark 🦈

A fast, addictive game where you evaluate startup pitches and decide whether to **invest or pass** —
building your reputation as a shark who can spot winners and dodge flops. Play in 2–5 minute
sessions, chase a daily challenge, and challenge friends with a shareable link.

> **Core hook:** *"Can you spot the next unicorn — or will you pour money into a flop?"*

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + Tailwind v4 + Zustand + React Router (SPA, PWA-friendly) |
| Backend | FastAPI (async) + SQLAlchemy + Alembic |
| Data | PostgreSQL + Redis |
| Deploy | Vercel (frontend) · Render (backend) · Supabase (Postgres) · Upstash (Redis) |

The frontend also runs in a **demo mode with mock data** when `VITE_API_URL` is empty — so it can be
deployed and played without a backend.

## Local development

**Backend** (Postgres + Redis + API via Docker):

```bash
cd backend
docker compose up -d          # postgres + redis + api on :8000 (DEBUG auto-creates tables + seeds)
```

**Frontend**:

```bash
npm install
npm run dev                   # http://localhost:5173
```

Point the frontend at the local API by setting `VITE_API_URL=http://localhost:8000` in `.env`
(see `.env.example`). Test account: `test@adshark.io` / `password123`.

## Environment variables

**Frontend** (`.env`, see `.env.example`):

| Var | Purpose |
|-----|---------|
| `VITE_API_URL` | Backend base URL. Empty = demo mode (mock data). |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Optional, for direct Supabase auth/leaderboard. |

**Backend** (`backend/.env`, see `backend/.env.example`):

| Var | Notes |
|-----|-------|
| `ENVIRONMENT` | `development` \| `production`. In `production`, the app refuses to start if `DEBUG=true` or `JWT_SECRET_KEY` is the default. |
| `DEBUG` | `false` in production (disables `/api/docs`, auto-create, and seeding). |
| `DATABASE_URL` | `postgresql+asyncpg://…` (note the `+asyncpg`). |
| `REDIS_URL` | `redis://…` |
| `JWT_SECRET_KEY` | Set a real secret in production. |
| `CORS_ORIGINS` | JSON list, e.g. `["https://adshark.io"]`. |

## Database migrations

Schema is managed by **Alembic** (`backend/alembic/`). The production image's `start.sh` runs
`alembic upgrade head` automatically before starting the server.

```bash
# create a new migration after changing models
docker compose run --rm --no-deps backend alembic revision --autogenerate -m "describe change"
# apply
docker compose run --rm --no-deps backend alembic upgrade head
```

> In `DEBUG` mode the app also auto-creates tables and seeds on boot, so local dev needs no manual
> migration step. `supabase/schema.sql` is legacy — Alembic is the source of truth.

## Seeding content

The game needs product/booster/achievement data. Seeding is **idempotent** (skips if a product
already exists). It runs automatically in `DEBUG`. In production, run it once:

```bash
# after the service is live and migrated
python -m app.seed          # inside the backend container/host
```

## Deployment

### 1. Database — Supabase
Create a project, grab the connection string, and convert it to async form:
`postgresql+asyncpg://USER:PASSWORD@HOST:5432/postgres`.

### 2. Redis — Upstash
Create a Redis database and copy its `redis://` URL.

### 3. Backend — Render
Deploy `backend/` as a **Docker** web service (a [`render.yaml`](render.yaml) blueprint is included).
Set `DATABASE_URL`, `REDIS_URL`, `CORS_ORIGINS` (and let Render generate `JWT_SECRET_KEY`).
Migrations run automatically on deploy via `start.sh`; then seed once (above).
Health check: `GET /api/health`.

### 4. Frontend — Vercel
Import the repo (root). Vercel auto-detects Vite (build `npm run build`, output `dist`).
Set `VITE_API_URL` to your Render URL. SPA routing is handled by [`vercel.json`](vercel.json).

### 5. Domain
Point `adshark.io` at the Vercel project, and add it to the backend's `CORS_ORIGINS`.

## Project layout

```
src/                 React app — screens/, components/, store/ (Zustand), services/ (api + generator)
backend/app/         FastAPI — api/ (routers), models/, schemas/, services/, seed.py, config.py
backend/alembic/     migrations (initial schema generated)
backend/start.sh     prod entrypoint: migrate → uvicorn (honors $PORT)
render.yaml          Render blueprint for the backend
docs/                PRODUCT_BRIEF, GAMEPLAY_SPEC, TECH_ARCHITECTURE
```
