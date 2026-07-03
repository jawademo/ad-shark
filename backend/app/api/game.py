"""
Game API routes — session management, round processing, scoring.
"""

from uuid import UUID
from datetime import datetime, timezone, date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    User, UserProfile, GameSession, SessionRound, Product, UserAchievement, Achievement,
)
from app.schemas import (
    CreateSessionRequest, SessionResponse, RoundDecision, RoundResult,
    EndSessionResponse, ProductBrief, AchievementOut,
)
from app.middleware.auth import get_current_user
from app.services.scoring import (
    calculate_round_profit, summarize_session, compute_risk_factor, assign_persona, assign_risk_profile,
    RoundInput,
)
from app.config import settings

router = APIRouter()


async def get_active_products(db: AsyncSession, count: int = 10) -> list[Product]:
    """Fetch N random active products for a session."""
    result = await db.execute(
        select(Product)
        .where(Product.is_active == True)  # noqa: E712
        .order_by(func.random())
        .limit(count)
    )
    return list(result.scalars().all())


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: CreateSessionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new game session."""
    # Check for existing active session and auto-close it
    existing = await db.execute(
        select(GameSession).where(
            GameSession.user_id == user.id,
            GameSession.status == "active",
        )
    )
    for old in existing.scalars().all():
        old.status = "abandoned"
        old.ended_at = datetime.now(timezone.utc)

    # Fetch products for the session
    product_count = 10  # default; varies by mode
    products = await get_active_products(db, count=product_count)

    starting_balance = settings.DEFAULT_STARTING_BALANCE

    session = GameSession(
        user_id=user.id,
        mode=data.mode,
        starting_balance=starting_balance,
        status="active",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return SessionResponse(
        id=session.id,
        mode=session.mode,
        starting_balance=session.starting_balance,
        status=session.status,
        started_at=session.started_at,
        products=[ProductBrief.model_validate(p) for p in products],
    )


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get session details."""
    result = await db.execute(
        select(GameSession).where(
            GameSession.id == session_id,
            GameSession.user_id == user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Also return the session's rounds and their products
    rounds_result = await db.execute(
        select(SessionRound).where(SessionRound.session_id == session_id)
        .order_by(SessionRound.round_number)
    )
    rounds = rounds_result.scalars().all()

    products = []
    for r in rounds:
        p = await db.get(Product, r.product_id)
        if p:
            products.append(ProductBrief.model_validate(p))

    return SessionResponse(
        id=session.id,
        mode=session.mode,
        starting_balance=session.starting_balance,
        status=session.status,
        started_at=session.started_at,
        products=products,
    )


@router.post("/sessions/{session_id}/rounds", response_model=RoundResult)
async def play_round(
    session_id: UUID,
    data: RoundDecision,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Make a decision on a product and get the result."""
    # Validate session ownership and status
    result = await db.execute(
        select(GameSession).where(
            GameSession.id == session_id,
            GameSession.user_id == user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session is not active")

    # Get the product
    product = await db.get(Product, data.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Anti-cheat: verify nonce hasn't been used in this session
    nonce_check = await db.execute(
        select(SessionRound).where(
            SessionRound.session_id == session_id,
            SessionRound.nonce == data.nonce,
        )
    )
    if nonce_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate round submission detected",
        )

    # Determine current balance from previous rounds
    prev_rounds = await db.execute(
        select(SessionRound).where(SessionRound.session_id == session_id)
    )
    prev = prev_rounds.scalars().all()
    current_balance = session.starting_balance + sum(
        (r.profit_loss or 0) for r in prev
    )

    # Validate investment amount
    if data.decision in ("invest", "counter_offer"):
        if data.investment_amount is None or data.investment_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Investment amount is required",
            )
        if data.investment_amount > current_balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance",
            )

    # Calculate result
    if data.decision == "pass":
        profit_loss = 0
        outcome = None
        multiplier = None
    else:
        outcome = product.outcome
        multiplier = product.outcome_multiplier
        profit_loss = calculate_round_profit(data.decision, data.investment_amount, multiplier)

    new_balance = current_balance + profit_loss

    # Record the round
    round_num = len(prev) + 1
    round_record = SessionRound(
        session_id=session_id,
        product_id=product.id,
        round_number=round_num,
        decision=data.decision,
        investment_amount=data.investment_amount,
        outcome_revealed=outcome,
        outcome_multiplier=multiplier,
        profit_loss=profit_loss,
        score_earned=0,  # calculated at session end
        nonce=data.nonce,
    )
    db.add(round_record)

    # Update session counters
    session.total_rounds = round_num
    if profit_loss and profit_loss > 0:
        session.correct_rounds += 1

    await db.commit()
    await db.refresh(round_record)

    return RoundResult(
        id=round_record.id,
        round_number=round_num,
        decision=data.decision,
        investment_amount=data.investment_amount,
        outcome_revealed=outcome,
        outcome_multiplier=multiplier,
        profit_loss=profit_loss,
        score_earned=0,
        new_balance=new_balance,
    )


@router.get("/sessions/{session_id}/rounds")
async def get_rounds(
    session_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all rounds for a session."""
    result = await db.execute(
        select(SessionRound)
        .where(SessionRound.session_id == session_id)
        .order_by(SessionRound.round_number)
    )
    rounds = result.scalars().all()

    # Recalculate balance progression
    session = await db.get(GameSession, session_id)
    balance = session.starting_balance if session else 0
    out = []
    for r in rounds:
        if r.profit_loss:
            balance += r.profit_loss
        out.append(RoundResult(
            id=r.id,
            round_number=r.round_number,
            decision=r.decision,
            investment_amount=r.investment_amount,
            outcome_revealed=r.outcome_revealed,
            outcome_multiplier=r.outcome_multiplier,
            profit_loss=r.profit_loss,
            score_earned=r.score_earned,
            new_balance=balance,
        ))
    return out


@router.post("/sessions/{session_id}/end", response_model=EndSessionResponse)
async def end_session(
    session_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End a session, calculate final score, and update profile."""
    result = await db.execute(
        select(GameSession).where(
            GameSession.id == session_id,
            GameSession.user_id == user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session already ended")

    # Get all rounds
    rounds_result = await db.execute(
        select(SessionRound).where(SessionRound.session_id == session_id)
        .order_by(SessionRound.round_number)
    )
    rounds = rounds_result.scalars().all()

    # Build RoundInput list for scoring
    balance = session.starting_balance
    round_inputs = []
    for r in rounds:
        ri = RoundInput(
            decision=r.decision,
            investment_amount=r.investment_amount or 0,
            starting_balance=balance,
            outcome_multiplier=r.outcome_multiplier or 0,
        )
        round_inputs.append(ri)
        balance += r.profit_loss or 0

    # Compute session summary
    summary = summarize_session(
        round_inputs,
        session.starting_balance,
        mode=session.mode,
        streak=0,  # will compute from profile
    )

    # Update session
    session.ending_balance = summary.ending_balance
    session.session_score = summary.investor_score
    session.status = "completed"
    session.ended_at = datetime.now(timezone.utc)

    # Update user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one()

    profile.xp += summary.xp_earned
    profile.shark_coins += summary.shark_coins_earned
    profile.total_rounds += summary.total_rounds
    profile.total_correct += summary.correct_rounds
    profile.total_profit += summary.total_profit
    if summary.biggest_win > profile.biggest_win:
        profile.biggest_win = summary.biggest_win
    if summary.biggest_loss > profile.biggest_loss:
        profile.biggest_loss = summary.biggest_loss

    # Recalculate accuracy
    if profile.total_rounds > 0:
        profile.accuracy = profile.total_correct / profile.total_rounds

    # Update investor score (cumulative)
    profile.investor_score = max(profile.investor_score, summary.investor_score)

    # Streaks
    today = date.today()
    if profile.last_play_date == today:
        pass  # already played today
    elif profile.last_play_date and (today - profile.last_play_date).days == 1:
        profile.play_streak += 1
    else:
        profile.play_streak = 1
    profile.last_play_date = today

    # Handle current session streak
    if summary.correct_rounds > profile.current_streak:
        profile.current_streak = summary.correct_rounds

    # Level calculation
    profile.level = calculate_level(profile.xp)

    # Risk profile + persona
    all_user_rounds = await get_all_user_round_inputs(db, user.id)
    rf = compute_risk_factor(all_user_rounds)
    profile.risk_profile = assign_risk_profile(rf)

    if profile.total_rounds >= 10:
        profile.persona = assign_persona(
            accuracy=profile.accuracy or 0,
            risk_factor=rf,
            total_rounds=profile.total_rounds,
            humor_preference=0.3,  # placeholder
            pass_rate=sum(1 for r in all_user_rounds if r.decision == "pass") / max(1, len(all_user_rounds)),
        )

    # Check for achievements
    achievements_unlocked = await check_achievements(
        db, user.id, profile, session, summary
    )

    await db.commit()

    return EndSessionResponse(
        session_id=session.id,
        final_balance=summary.ending_balance,
        session_score=summary.investor_score,
        total_rounds=summary.total_rounds,
        correct_rounds=summary.correct_rounds,
        accuracy=summary.accuracy,
        xp_earned=summary.xp_earned,
        shark_coins_earned=summary.shark_coins_earned,
        achievements_unlocked=achievements_unlocked,
        persona_update=profile.persona,
    )


# ── Helpers ───────────────────────────────────────────────────────────

def calculate_level(xp: int) -> int:
    """Simple level formula: level = floor(sqrt(xp / 100)) + 1"""
    import math
    return int(math.sqrt(xp / 100)) + 1


async def get_all_user_round_inputs(db: AsyncSession, user_id: UUID) -> list[RoundInput]:
    """Get all round inputs for a user across all sessions."""
    sessions_result = await db.execute(
        select(GameSession).where(GameSession.user_id == user_id)
    )
    sessions = sessions_result.scalars().all()

    all_inputs = []
    for s in sessions:
        rounds_result = await db.execute(
            select(SessionRound).where(SessionRound.session_id == s.id)
            .order_by(SessionRound.round_number)
        )
        rounds = rounds_result.scalars().all()
        balance = s.starting_balance
        for r in rounds:
            all_inputs.append(RoundInput(
                decision=r.decision,
                investment_amount=r.investment_amount or 0,
                starting_balance=balance,
                outcome_multiplier=r.outcome_multiplier or 0,
            ))
            balance += r.profit_loss or 0
    return all_inputs


async def check_achievements(
    db: AsyncSession,
    user_id: UUID,
    profile: UserProfile,
    session: GameSession,
    summary,
) -> list:
    """Check and award new achievements. Returns list of newly earned."""
    # Get existing achievements
    existing_result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == user_id)
    )
    existing_codes = set()
    for ua in existing_result.scalars().all():
        ach = await db.get(Achievement, ua.achievement_id)
        if ach:
            existing_codes.add(ach.code)

    # Get all achievement definitions
    all_ach_result = await db.execute(select(Achievement))
    all_achievements = {a.code: a for a in all_ach_result.scalars().all()}

    newly_earned = []

    def award(code: str):
        if code in existing_codes or code in {a.code for a in newly_earned}:
            return
        ach = all_achievements.get(code)
        if not ach:
            return
        ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
        db.add(ua)
        newly_earned.append(AchievementOut(
            code=ach.code, name=ach.name, description=ach.description,
            rarity=ach.rarity, icon=ach.icon, earned_at=datetime.now(timezone.utc),
        ))

    # Check each achievement condition
    if profile.total_rounds >= 1:
        award("first_blood")
    if profile.best_streak >= 5:
        award("hot_streak")
    if profile.best_streak >= 10:
        award("perfect_10")
    if profile.biggest_win >= 50000:
        award("whale")
    if profile.play_streak >= 7:
        award("daily_grinder")
    if profile.total_rounds >= 100:
        award("century")
    if profile.total_rounds >= 1000:
        award("grandmaster")
    if profile.accuracy and profile.accuracy >= 0.90 and profile.total_rounds >= 100:
        award("oracle")
    if profile.investor_score >= 100000:
        award("great_white")

    return newly_earned
