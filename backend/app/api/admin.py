"""
Admin API routes — product management, stats, challenge generation.
"""

from uuid import UUID
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    User, Product, DailyChallenge, GameSession, DailyChallengeParticipation,
)
from app.schemas import (
    ProductAdmin, ProductBulkCreate, AdminStats, PaginatedResponse,
)
from app.middleware.auth import get_current_admin
from app.config import settings

router = APIRouter()


# ── Products ──────────────────────────────────────────────────────────

@router.get("/products")
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    category: Optional[str] = None,
    rarity: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Paginated list of all products."""
    query = select(Product)

    if category:
        query = query.where(Product.category == category)
    if rarity:
        query = query.where(Product.rarity == rarity)
    if is_active is not None:
        query = query.where(Product.is_active == is_active)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    offset = (page - 1) * page_size
    result = await db.execute(
        query.order_by(Product.created_at.desc()).offset(offset).limit(page_size)
    )
    products = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedResponse(
        items=[ProductAdmin.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/products", response_model=ProductAdmin, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductAdmin,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create a single product."""
    product = Product(
        name=data.name,
        tagline=data.tagline,
        description=data.description,
        category=data.category,
        difficulty=data.difficulty,
        outcome=data.outcome,
        outcome_multiplier=data.outcome_multiplier,
        market_signals=data.market_signals,
        era=data.era,
        tags=data.tags,
        rarity=data.rarity,
        humor_level=data.humor_level,
        realism=data.realism,
        is_active=data.is_active,
        created_by="admin",
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return ProductAdmin.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductAdmin)
async def update_product(
    product_id: UUID,
    data: ProductAdmin,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update a product."""
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    product.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(product)
    return ProductAdmin.model_validate(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Soft-delete a product (deactivate)."""
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product.is_active = False
    product.updated_at = datetime.now(timezone.utc)
    await db.commit()


@router.post("/products/bulk", status_code=status.HTTP_201_CREATED)
async def bulk_create_products(
    data: ProductBulkCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create multiple products at once."""
    created = []
    for p_data in data.products:
        product = Product(
            name=p_data.name,
            tagline=p_data.tagline,
            description=p_data.description,
            category=p_data.category,
            difficulty=p_data.difficulty,
            outcome=p_data.outcome,
            outcome_multiplier=p_data.outcome_multiplier,
            market_signals=p_data.market_signals,
            era=p_data.era,
            tags=p_data.tags,
            rarity=p_data.rarity,
            humor_level=p_data.humor_level,
            realism=p_data.realism,
            is_active=p_data.is_active,
            created_by="admin",
        )
        db.add(product)
        created.append(product)

    await db.commit()
    return {"created_count": len(created)}


# ── Challenge generation ──────────────────────────────────────────────

@router.post("/challenges/generate", status_code=status.HTTP_201_CREATED)
async def generate_daily_challenge(
    challenge_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Generate a daily challenge for a specific date (defaults to tomorrow)."""
    target_date = challenge_date or (date.today() + __import__('datetime').timedelta(days=1))

    # Check if one already exists
    existing = await db.execute(
        select(DailyChallenge).where(DailyChallenge.challenge_date == target_date)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Challenge already exists for {target_date}",
        )

    # Select 5 random active products
    import random as _random
    products_result = await db.execute(
        select(Product).where(Product.is_active == True)  # noqa: E712
    )
    products = products_result.scalars().all()

    if len(products) < settings.DAILY_CHALLENGE_PRODUCT_COUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Need at least {settings.DAILY_CHALLENGE_PRODUCT_COUNT} active products",
        )

    selected = _random.sample(products, settings.DAILY_CHALLENGE_PRODUCT_COUNT)

    challenge = DailyChallenge(
        challenge_date=target_date,
        product_ids=[p.id for p in selected],
    )
    db.add(challenge)
    await db.commit()

    return {
        "id": str(challenge.id),
        "challenge_date": str(challenge.challenge_date),
        "product_ids": [str(pid) for pid in challenge.product_ids],
        "product_count": len(challenge.product_ids),
    }


# ── Stats ─────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get platform stats for admin dashboard."""
    today = date.today()

    total_users = (await db.execute(select(func.count(User.id)))).scalar()

    # DAU — users who played today
    dau = (await db.execute(
        select(func.count(func.distinct(GameSession.user_id)))
        .where(func.date(GameSession.started_at) == today)
    )).scalar()

    # WAU
    week_ago = today - __import__('datetime').timedelta(days=7)
    wau = (await db.execute(
        select(func.count(func.distinct(GameSession.user_id)))
        .where(func.date(GameSession.started_at) >= week_ago)
    )).scalar()

    # Sessions today
    sessions_today = (await db.execute(
        select(func.count(GameSession.id))
        .where(func.date(GameSession.started_at) == today)
    )).scalar()

    # Daily challenges completed today
    daily_completed = (await db.execute(
        select(func.count(DailyChallengeParticipation.id))
        .where(func.date(DailyChallengeParticipation.completed_at) == today)
    )).scalar()

    return AdminStats(
        total_users=total_users or 0,
        daily_active_users=dau or 0,
        weekly_active_users=wau or 0,
        total_sessions_today=sessions_today or 0,
        total_daily_challenges_completed=daily_completed or 0,
        total_shares=0,  # placeholder
        top_product_id=None,
    )
