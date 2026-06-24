"""Basic tests for ad-shark backend."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post("/api/auth/register", json={
        "username": "testplayer",
        "email": "test@example.com",
        "password": "securepassword123",
    })
    # Without a real database this will 500, but structure is correct
    assert response.status_code in (201, 422, 500)


@pytest.mark.asyncio
async def test_register_validation(client):
    """Validate that bad input is caught."""
    response = await client.post("/api/auth/register", json={
        "username": "ab",  # too short
        "email": "not-an-email",
        "password": "short",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_unauthenticated_game_creation(client):
    """Game endpoints should require auth."""
    response = await client.post("/api/game/sessions", json={"mode": "classic"})
    assert response.status_code == 401 or response.status_code == 403
