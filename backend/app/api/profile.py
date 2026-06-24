"""
Profile & progression API routes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserProfile, UserAchievement, Achievement
from app.schemas import UserProfileOut, PlayerStats, AchievementOut
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("", response_model=UserProfileOut)
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return UserProfileOut.model_validate(profile)


@router.get("/stats", response_model=PlayerStats)
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed stats for the stats screen."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return PlayerStats(
        investor_score=profile.investor_score,
        accuracy=profile.accuracy or 0,
        total_rounds=profile.total_rounds,
        total_correct=profile.total_correct,
        total_profit=profile.total_profit,
        biggest_win=profile.biggest_win,
        biggest_loss=profile.biggest_loss,
        current_streak=profile.current_streak,
        best_streak=profile.best_streak,
        level=profile.level,
        xp=profile.xp,
        persona=profile.persona,
        risk_profile=profile.risk_profile,
    )


@router.get("/achievements")
async def get_achievements(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all achievements (earned + unearned) for the user."""
    # Get all achievement definitions
    all_ach = await db.execute(select(Achievement))
    all_achievements = {a.id: a for a in all_ach.scalars().all()}

    # Get user's earned achievements
    earned_result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == user.id)
    )
    earned_ids = {ua.achievement_id: ua.earned_at for ua in earned_result.scalars().all()}

    out = []
    for ach_id, ach in all_achievements.items():
        out.append(AchievementOut(
            code=ach.code,
            name=ach.name,
            description=ach.description,
            rarity=ach.rarity,
            icon=ach.icon,
            earned_at=earned_ids.get(ach_id),
        ))

    return out
