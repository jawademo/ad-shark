#!/usr/bin/env sh
set -e

# Production entrypoint: apply DB migrations, seed baseline content (idempotent —
# skips if products already exist), then start the API server.
# Honors $PORT (Render/Railway inject it); defaults to 8000.
alembic upgrade head
python -m app.seed
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
