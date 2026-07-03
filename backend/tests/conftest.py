"""Shared test fixtures.

Provisions a clean database schema around each test so the API tests run against
real tables (the CI Postgres service starts empty). The module-level async engine
is disposed after each test to avoid reusing a connection pool across event loops.
"""

import pytest

from app.database import engine, Base
import app.models  # noqa: F401 — importing registers all models on Base.metadata


@pytest.fixture(autouse=True)
async def _database_schema():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    try:
        yield
    finally:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await engine.dispose()
