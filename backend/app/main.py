"""
ad-shark FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app.models import Base  # noqa: F401 — registers models

# Import all routers
from app.api import auth, game, challenges, leaderboard, social, profile, shop, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    async with engine.begin() as conn:
        if settings.DEBUG:
            await conn.run_sync(Base.metadata.create_all)

    if settings.DEBUG:
        from app.seed import seed
        await seed()

    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(game.router, prefix="/api/game", tags=["game"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])
app.include_router(social.router, prefix="/api/social", tags=["social"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(shop.router, prefix="/api/shop", tags=["shop"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
