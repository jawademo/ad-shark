"""
Challenge API routes — daily challenges and friend challenges.
"""

from uuid import UUID
from datetime import date, datetime, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    User, GameSession, Product, DailyChallenge, DailyChallengeParticipation,
    FriendChallenge,
)
from app.schemas import (
    DailyChallengeResponse, DailyChallengeSubmit, DailyChallengeResult,
    CreateFriendChallengeRequest, FriendChallengeResponse,
    FriendChallengePreview, ProductBrief, SessionResponse,
)
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter()


# ── Daily Challenge ───────────────────────────────────────────────────

@router.get("/daily", response_model=DailyChallengeResponse)
async def get_daily_challenge(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get today's daily challenge, if available."""
    today = date.today()

    # Find today's challenge
    challenge_result = await db.execute(
        select(DailyChallenge).where(DailyChallenge.challenge_date == today, DailyChallenge.is_active == True)  # noqa: E712
    )
    challenge = challenge_result.scalar_one_or_none()

    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No daily challenge available today. Check back soon!",
        )

    # Check if user already completed
    participation = await db.execute(
        select(DailyChallengeParticipation).where(
            DailyChallengeParticipation.user_id == user.id,
            DailyChallengeParticipation.challenge_id == challenge.id,
        )
    )
    already_completed = participation.scalar_one_or_none() is not None

    # Fetch the products for this challenge
    products = []
    for pid in challenge.product_ids:
        p = await db.get(Product, pid)
        if p and p.is_active:
            products.append(ProductBrief.model_validate(p))

    return DailyChallengeResponse(
        id=challenge.id,
        challenge_date=challenge.challenge_date,
        products=products,
        completed=already_completed,
    )


@router.post("/daily/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_daily_challenge(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start playing today's daily challenge."""
    today = date.today()

    challenge_result = await db.execute(
        select(DailyChallenge).where(DailyChallenge.challenge_date == today, DailyChallenge.is_active == True)  # noqa: E712
    )
    challenge = challenge_result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No challenge today")

    # Check for existing completion
    existing_participation = await db.execute(
        select(DailyChallengeParticipation).where(
            DailyChallengeParticipation.user_id == user.id,
            DailyChallengeParticipation.challenge_id == challenge.id,
        )
    )
    if existing_participation.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You've already completed today's challenge",
        )

    # Create a session for the daily challenge
    session = GameSession(
        user_id=user.id,
        mode="daily",
        challenge_id=challenge.id,
        starting_balance=settings.DEFAULT_STARTING_BALANCE,
        status="active",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Fetch products
    products = []
    for pid in challenge.product_ids:
        p = await db.get(Product, pid)
        if p and p.is_active:
            products.append(ProductBrief.model_validate(p))

    return SessionResponse(
        id=session.id,
        mode="daily",
        starting_balance=session.starting_balance,
        status=session.status,
        started_at=session.started_at,
        products=products,
    )


@router.post("/daily/{challenge_id}/submit", response_model=DailyChallengeResult)
async def submit_daily_challenge(
    challenge_id: UUID,
    data: DailyChallengeSubmit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit decisions for the daily challenge and get results."""
    # Verify challenge exists and user hasn't completed
    challenge = await db.get(DailyChallenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    existing = await db.execute(
        select(DailyChallengeParticipation).where(
            DailyChallengeParticipation.user_id == user.id,
            DailyChallengeParticipation.challenge_id == challenge_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already submitted")

    # Validate all 5 products are decided
    if len(data.decisions) != len(challenge.product_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Must submit decisions for all {len(challenge.product_ids)} products",
        )

    # Score
    correct_count = 0
    total_score = 0
    for decision in data.decisions:
        product = await db.get(Product, decision.product_id)
        if not product:
            continue
        if decision.decision == "invest" and product.outcome in ("success", "breakout"):
            correct_count += 1
            if product.outcome == "breakout":
                total_score += int(settings.DEFAULT_STARTING_BALANCE * product.outcome_multiplier)
            else:
                total_score += int(settings.DEFAULT_STARTING_BALANCE * 0.5)
        elif decision.decision == "pass" and product.outcome == "flop":
            correct_count += 1
            total_score += settings.DEFAULT_STARTING_BALANCE  # preserved capital

    # Record participation
    # Find the session that was created for this challenge
    session_result = await db.execute(
        select(GameSession).where(
            GameSession.user_id == user.id,
            GameSession.mode == "daily",
            GameSession.challenge_id == challenge_id,
        )
    )
    session = session_result.scalar_one_or_none()

    participation = DailyChallengeParticipation(
        user_id=user.id,
        challenge_id=challenge_id,
        session_id=session.id if session else UUID("00000000-0000-0000-0000-000000000000"),
        score=total_score,
        correct_count=correct_count,
    )
    db.add(participation)

    # End the session
    if session:
        session.status = "completed"
        session.ended_at = datetime.now(timezone.utc)
        session.ending_balance = total_score
        session.session_score = total_score

    await db.commit()

    # Calculate rank
    total_players_result = await db.execute(
        select(DailyChallengeParticipation).where(
            DailyChallengeParticipation.challenge_id == challenge_id,
        )
    )
    all_scores = sorted(
        [p.score for p in total_players_result.scalars().all()],
        reverse=True,
    )
    total_players = len(all_scores)
    rank = all_scores.index(total_score) + 1 if total_score in all_scores else total_players

    return DailyChallengeResult(
        score=total_score,
        correct_count=correct_count,
        total_products=len(challenge.product_ids),
        rank=rank,
        total_players=total_players,
        xp_earned=50 + (correct_count * 25),
        streak=0,  # Updated elsewhere
    )


@router.get("/daily/{challenge_date}/leaderboard")
async def daily_leaderboard(
    challenge_date: date,
    db: AsyncSession = Depends(get_db),
):
    """Get leaderboard for a specific daily challenge."""
    challenge_result = await db.execute(
        select(DailyChallenge).where(DailyChallenge.challenge_date == challenge_date)
    )
    challenge = challenge_result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    participations_result = await db.execute(
        select(DailyChallengeParticipation)
        .where(DailyChallengeParticipation.challenge_id == challenge.id)
        .order_by(DailyChallengeParticipation.score.desc())
        .limit(100)
    )
    participations = participations_result.scalars().all()

    leaderboard = []
    for i, p in enumerate(participations):
        user = await db.get(User, p.user_id)
        leaderboard.append({
            "rank": i + 1,
            "user_id": str(p.user_id),
            "username": user.username if user else "unknown",
            "display_name": user.display_name if user else None,
            "avatar_url": user.avatar_url if user else None,
            "score": p.score,
            "correct_count": p.correct_count,
        })

    return leaderboard


@router.get("/daily/streak")
async def daily_streak(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's daily challenge streak."""
    from app.models import UserProfile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    return {"current_streak": profile.play_streak if profile else 0}


# ── Friend Challenges ─────────────────────────────────────────────────

def generate_challenge_code() -> str:
    """Generate a short, readable challenge code."""
    return secrets.token_hex(4)[:8]


@router.post("/friends", response_model=FriendChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_friend_challenge(
    data: CreateFriendChallengeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a challenge to share with a friend."""
    # Fetch random products
    products_result = await db.execute(
        select(Product)
        .where(Product.is_active == True)  # noqa: E712
        .limit(10)
    )
    products = products_result.scalars().all()

    if len(products) < 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough products")

    code = generate_challenge_code()

    challenge = FriendChallenge(
        challenger_id=user.id,
        challenge_code=code,
        mode=data.mode,
        product_ids=[p.id for p in products],
        starting_balance=settings.DEFAULT_STARTING_BALANCE,
        expires_at=datetime.now(timezone.utc) + datetime.timedelta(days=7),
    )
    db.add(challenge)
    await db.commit()

    share_url = f"https://adshark.io/challenge/{code}"

    return FriendChallengeResponse(
        challenge_code=code,
        share_url=share_url,
        challenger_name=user.display_name or user.username,
        mode=data.mode,
        starting_balance=settings.DEFAULT_STARTING_BALANCE,
        product_count=len(products),
    )


@router.get("/friends/{code}", response_model=FriendChallengePreview)
async def preview_friend_challenge(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    """Preview a friend challenge before accepting."""
    result = await db.execute(
        select(FriendChallenge).where(FriendChallenge.challenge_code == code)
    )
    challenge = result.scalar_one_or_none()

    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    if challenge.expires_at and challenge.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Challenge expired")

    challenger = await db.get(User, challenge.challenger_id)

    return FriendChallengePreview(
        challenge_code=code,
        challenger_name=challenger.display_name or challenger.username if challenger else "Unknown",
        mode=challenge.mode,
        starting_balance=challenge.starting_balance,
        product_count=len(challenge.product_ids),
        challenger_score=challenge.challenger_score,
    )


@router.post("/friends/{code}/accept", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def accept_friend_challenge(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Accept a friend challenge and get a session."""
    result = await db.execute(
        select(FriendChallenge).where(FriendChallenge.challenge_code == code)
    )
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    # Create session with same products
    session = GameSession(
        user_id=user.id,
        mode="head_to_head",
        starting_balance=challenge.starting_balance,
        status="active",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    products = []
    for pid in challenge.product_ids:
        p = await db.get(Product, pid)
        if p:
            products.append(ProductBrief.model_validate(p))

    return SessionResponse(
        id=session.id,
        mode="head_to_head",
        starting_balance=session.starting_balance,
        status=session.status,
        started_at=session.started_at,
        products=products,
    )
