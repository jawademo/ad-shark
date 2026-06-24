"""
SQLAlchemy ORM models for ad-shark.
"""

import uuid
from datetime import date, datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, BigInteger, Float,
    Date, DateTime, ForeignKey, Text, UniqueConstraint, Index, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


def new_uuid():
    return uuid.uuid4()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    username = Column(String(30), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    display_name = Column(String(50), nullable=True)
    avatar_url = Column(Text, nullable=True)
    auth_provider = Column(String(20), default="email")
    auth_provider_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("GameSession", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    boosters = relationship("UserBooster", back_populates="user", cascade="all, delete-orphan")
    referrals_made = relationship("Referral", back_populates="referrer", foreign_keys="Referral.referrer_id")
    daily_participations = relationship("DailyChallengeParticipation", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    shark_coins = Column(Integer, default=0)
    investor_score = Column(BigInteger, default=0)
    accuracy = Column(Float, nullable=True)
    total_rounds = Column(Integer, default=0)
    total_correct = Column(Integer, default=0)
    total_profit = Column(BigInteger, default=0)
    biggest_win = Column(BigInteger, default=0)
    biggest_loss = Column(BigInteger, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    play_streak = Column(Integer, default=0)
    last_play_date = Column(Date, nullable=True)
    persona = Column(String(50), nullable=True)
    risk_profile = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    name = Column(String(100), nullable=False)
    tagline = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    difficulty = Column(Integer, nullable=False, index=True)
    outcome = Column(String(20), nullable=False)
    outcome_multiplier = Column(Float, nullable=False)
    market_signals = Column(JSONB, default=list)
    era = Column(String(50), nullable=True)
    tags = Column(JSONB, default=list)
    rarity = Column(String(20), default="common", index=True)
    humor_level = Column(Integer, default=0)
    realism = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    created_by = Column(String(20), default="admin")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("difficulty BETWEEN 1 AND 5", name="ck_product_difficulty"),
        CheckConstraint("outcome IN ('success','flop','moderate','breakout')", name="ck_product_outcome"),
        CheckConstraint("rarity IN ('common','uncommon','rare','legendary')", name="ck_product_rarity"),
        CheckConstraint("humor_level BETWEEN 0 AND 5", name="ck_product_humor"),
        CheckConstraint("realism BETWEEN 0 AND 5", name="ck_product_realism"),
    )


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    mode = Column(String(20), nullable=False, index=True)
    challenge_id = Column(UUID(as_uuid=True), nullable=True)
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    starting_balance = Column(BigInteger, nullable=False)
    ending_balance = Column(BigInteger, nullable=True)
    total_rounds = Column(Integer, default=0)
    correct_rounds = Column(Integer, default=0)
    session_score = Column(BigInteger, nullable=True)
    status = Column(String(20), default="active", index=True)

    __table_args__ = (
        CheckConstraint("mode IN ('classic','streak','daily','head_to_head','speed','themed')", name="ck_session_mode"),
        CheckConstraint("status IN ('active','completed','abandoned')", name="ck_session_status"),
    )

    user = relationship("User", back_populates="sessions")
    rounds = relationship("SessionRound", back_populates="session", cascade="all, delete-orphan")


class SessionRound(Base):
    __tablename__ = "session_rounds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    decision = Column(String(20), nullable=False)
    investment_amount = Column(BigInteger, nullable=True)
    booster_used = Column(UUID(as_uuid=True), nullable=True)
    outcome_revealed = Column(String(20), nullable=True)
    outcome_multiplier = Column(Float, nullable=True)
    profit_loss = Column(BigInteger, nullable=True)
    score_earned = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    nonce = Column(UUID(as_uuid=True), nullable=False, default=new_uuid)

    __table_args__ = (
        CheckConstraint("decision IN ('invest','pass','counter_offer')", name="ck_round_decision"),
    )

    session = relationship("GameSession", back_populates="rounds")


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    challenge_date = Column(Date, unique=True, nullable=False, index=True)
    product_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class DailyChallengeParticipation(Base):
    __tablename__ = "daily_challenge_participations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("daily_challenges.id"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id"), nullable=False)
    score = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    completed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "challenge_id", name="uq_daily_participation"),
    )

    user = relationship("User", back_populates="daily_participations")


class FriendChallenge(Base):
    __tablename__ = "friend_challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    challenger_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_code = Column(String(8), unique=True, nullable=False, index=True)
    mode = Column(String(20), default="head_to_head")
    product_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=False)
    starting_balance = Column(BigInteger, nullable=False)
    challenger_score = Column(BigInteger, nullable=True)
    challenger_session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    times_played = Column(Integer, default=0)


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    leaderboard_type = Column(String(20), nullable=False)
    leaderboard_key = Column(String(50), nullable=True)
    score = Column(BigInteger, nullable=False)
    rank = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "leaderboard_type IN ('daily','weekly','all_time','category','mode')",
            name="ck_leaderboard_type"
        ),
        UniqueConstraint("user_id", "leaderboard_type", "leaderboard_key", name="uq_leaderboard_entry"),
    )


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    rarity = Column(String(20), nullable=False)
    icon = Column(String(50), nullable=True)
    xp_reward = Column(Integer, default=0)
    shark_coin_reward = Column(Integer, default=0)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    user = relationship("User", back_populates="achievements")


class Booster(Base):
    __tablename__ = "boosters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    effect_type = Column(String(50), nullable=False)
    effect_value = Column(Float, nullable=True)
    rarity = Column(String(20), nullable=False)
    cost_shark_coins = Column(Integer, nullable=False)
    max_active = Column(Integer, default=1)
    cooldown_minutes = Column(Integer, nullable=True)
    usable_in_daily = Column(Boolean, default=False)


class UserBooster(Base):
    __tablename__ = "user_boosters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    booster_id = Column(UUID(as_uuid=True), ForeignKey("boosters.id"), nullable=False)
    quantity = Column(Integer, default=1)
    acquired_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="boosters")


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    referrer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    referred_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, unique=True)
    referral_code = Column(String(12), unique=True, nullable=False)
    status = Column(String(20), default="pending")
    reward_claimed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','signed_up','played','rewarded')",
            name="ck_referral_status"
        ),
    )

    referrer = relationship("User", back_populates="referrals_made", foreign_keys=[referrer_id])
