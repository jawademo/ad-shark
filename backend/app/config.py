"""
ad-shark backend — FastAPI application configuration.

All settings loaded from environment variables with sensible defaults for local dev.
"""

from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ad-shark"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:4173"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/adshark"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Auth
    JWT_SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Rate limiting
    RATE_LIMIT_DEFAULT: int = 60  # requests per minute
    RATE_LIMIT_AUTH_REGISTER: int = 3  # per hour
    RATE_LIMIT_AUTH_LOGIN: int = 10  # per minute

    # Game
    DEFAULT_STARTING_BALANCE: int = 10_000  # $10,000
    DAILY_CHALLENGE_PRODUCT_COUNT: int = 5
    MAX_BOOSTERS_ACTIVE: int = 3

    # Content
    PRODUCTS_PER_SESSION_MIN: int = 5
    PRODUCTS_PER_SESSION_MAX: int = 50

    # Analytics
    POSTHOG_API_KEY: Optional[str] = None
    POSTHOG_HOST: str = "https://app.posthog.com"

    # Sentry
    SENTRY_DSN: Optional[str] = None

    # Storage (S3/R2 for share card images)
    STORAGE_ENDPOINT: Optional[str] = None
    STORAGE_ACCESS_KEY: Optional[str] = None
    STORAGE_SECRET_KEY: Optional[str] = None
    STORAGE_BUCKET: str = "adshark-assets"
    STORAGE_PUBLIC_URL: Optional[str] = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @model_validator(mode="after")
    def _guard_production(self):
        """Fail fast on insecure production configuration."""
        if self.ENVIRONMENT == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production (set DEBUG=false).")
            if self.JWT_SECRET_KEY == "change-me-in-production-use-a-real-secret":
                raise ValueError(
                    "JWT_SECRET_KEY is still the default — set a real secret in production."
                )
        return self


settings = Settings()
