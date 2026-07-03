#!/usr/bin/env sh
set -e

# Production entrypoint: apply database migrations, then start the API server.
# Honors $PORT (Render/Railway inject it); defaults to 8000.
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
