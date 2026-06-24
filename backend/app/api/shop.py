"""
Shop API routes — booster inventory and purchases.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserProfile, Booster, UserBooster
from app.schemas import BoosterOut, BuyBoosterResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/boosters")
async def get_boosters(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all boosters with user's owned quantities."""
    # All boosters
    boosters_result = await db.execute(select(Booster))
    boosters = boosters_result.scalars().all()

    # User's inventory
    inventory_result = await db.execute(
        select(UserBooster).where(UserBooster.user_id == user.id)
    )
    inventory = {ub.booster_id: ub.quantity for ub in inventory_result.scalars().all()}

    out = []
    for b in boosters:
        out.append(BoosterOut(
            id=b.id,
            code=b.code,
            name=b.name,
            description=b.description,
            effect_type=b.effect_type,
            rarity=b.rarity,
            cost_shark_coins=b.cost_shark_coins,
            usable_in_daily=b.usable_in_daily,
            owned_quantity=inventory.get(b.id, 0),
        ))

    return out


@router.post("/boosters/{booster_id}/buy", response_model=BuyBoosterResponse)
async def buy_booster(
    booster_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Purchase a booster with Shark Coins."""
    booster = await db.get(Booster, booster_id)
    if not booster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booster not found")

    # Get profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    # Check affordability
    if profile.shark_coins < booster.cost_shark_coins:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient Shark Coins. Have {profile.shark_coins}, need {booster.cost_shark_coins}.",
        )

    # Deduct coins
    profile.shark_coins -= booster.cost_shark_coins

    # Add to inventory
    inventory_result = await db.execute(
        select(UserBooster).where(
            UserBooster.user_id == user.id,
            UserBooster.booster_id == booster_id,
        )
    )
    inventory = inventory_result.scalar_one_or_none()

    if inventory:
        inventory.quantity += 1
    else:
        inventory = UserBooster(
            user_id=user.id,
            booster_id=booster_id,
            quantity=1,
        )
        db.add(inventory)

    await db.commit()
    await db.refresh(inventory)

    return BuyBoosterResponse(
        booster=BoosterOut(
            id=booster.id,
            code=booster.code,
            name=booster.name,
            description=booster.description,
            effect_type=booster.effect_type,
            rarity=booster.rarity,
            cost_shark_coins=booster.cost_shark_coins,
            usable_in_daily=booster.usable_in_daily,
            owned_quantity=inventory.quantity,
        ),
        shark_coins_remaining=profile.shark_coins,
    )
