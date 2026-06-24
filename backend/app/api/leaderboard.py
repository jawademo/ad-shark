"""
Leaderboard API routes.
"""

from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import UserProfile, User
from app.middleware.auth import get_optional_user

router = APIRouter()


LEADERBOARD_LIMIT = 100


@router.get("")
async def get_leaderboard(
    type: str = Query("all_time", description="daily | weekly | all_time | category"),
    key: str = Query(None, description="'2024-06-15' or '2024-W24' or 'ai_tech'"),
    limit: int = Query(LEADERBOARD_LIMIT, le=LEADERBOARD_LIMIT),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Get leaderboard entries."""
    query = (
        select(UserProfile, User.username, User.display_name, User.avatar_url)
        .join(User, UserProfile.user_id == User.id)
        .where(User.is_active == True)  # noqa: E712
        .order_by(UserProfile.investor_score.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    entries = []
    for i, (profile, username, display_name, avatar_url) in enumerate(rows):
        entries.append({
            "rank": i + 1,
            "user_id": str(profile.user_id),
            "username": username,
            "display_name": display_name,
            "avatar_url": avatar_url,
            "score": profile.investor_score,
        })

    return entries


@router.get("/daily/{challenge_date}")
async def get_daily_leaderboard(
    challenge_date: date,
    db: AsyncSession = Depends(get_db),
):
    """Get the daily challenge leaderboard for a specific date."""
    # Delegated to challenges router — placeholder
    from app.models import DailyChallenge, DailyChallengeParticipation

    challenge_result = await db.execute(
        select(DailyChallenge).where(DailyChallenge.challenge_date == challenge_date)
    )
    challenge = challenge_result.scalar_one_or_none()
    if not challenge:
        return []

    participations_result = await db.execute(
        select(DailyChallengeParticipation)
        .where(DailyChallengeParticipation.challenge_id == challenge.id)
        .order_by(DailyChallengeParticipation.score.desc())
        .limit(LEADERBOARD_LIMIT)
    )
    participations = participations_result.scalars().all()

    entries = []
    for i, p in enumerate(participations):
        user = await db.get(User, p.user_id)
        entries.append({
            "rank": i + 1,
            "user_id": str(p.user_id),
            "username": user.username if user else "unknown",
            "display_name": user.display_name if user else None,
            "avatar_url": user.avatar_url if user else None,
            "score": p.score,
            "correct_count": p.correct_count,
        })

    return entries
