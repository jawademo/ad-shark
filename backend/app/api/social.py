"""
Social API routes — sharing, referrals.
"""

import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserProfile, Referral
from app.schemas import ReferralInfo
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/referrals/code", response_model=ReferralInfo)
async def get_referral_code(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get (or create) the user's referral code and stats."""
    # Find existing referral code
    result = await db.execute(
        select(Referral).where(Referral.referrer_id == user.id)
    )
    existing = result.scalars().all()

    if not existing:
        # Create a referral code
        code = secrets.token_hex(6)[:12]
        referral = Referral(
            referrer_id=user.id,
            referral_code=code,
        )
        db.add(referral)
        await db.commit()
        referral_code = code
    else:
        referral_code = existing[0].referral_code

    # Count successful referrals
    total_referred = sum(1 for r in existing if r.status in ("signed_up", "played", "rewarded"))
    rewards_earned = sum(1 for r in existing if r.reward_claimed)

    share_url = f"https://adshark.io/join/{referral_code}"

    return ReferralInfo(
        referral_code=referral_code,
        share_url=share_url,
        total_referred=total_referred,
        rewards_earned=rewards_earned,
    )


@router.post("/referrals/claim/{code}")
async def claim_referral_reward(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Claim a referral reward for a referred user who signed up."""
    result = await db.execute(
        select(Referral).where(Referral.referral_code == code)
    )
    referral = result.scalar_one_or_none()

    if not referral:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referral code not found")

    # Check if this user is claiming their own referral
    if referral.referrer_id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot refer yourself")

    # Check if already claimed by someone
    if referral.referred_user_id is not None and referral.referred_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referral already claimed")

    referral.referred_user_id = user.id
    referral.status = "signed_up"

    # Reward the referrer
    if not referral.reward_claimed:
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == referral.referrer_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile:
            profile.shark_coins += 100  # Referral bonus
            profile.xp += 50
        referral.reward_claimed = True

    await db.commit()

    return {"message": "Referral claimed successfully", "bonus_coins": 100}
