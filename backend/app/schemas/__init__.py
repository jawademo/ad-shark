"""
Pydantic schemas for request/response validation.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth ──────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_not_reserved(cls, v: str) -> str:
        reserved = {"admin", "root", "system", "adshark", "mod", "moderator"}
        if v.lower() in reserved:
            raise ValueError(f"Username '{v}' is reserved")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserPublic(BaseModel):
    id: UUID
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=50)
    avatar_url: Optional[str] = None


# ── Profile / Progression ────────────────────────────────────────────

class UserProfileOut(BaseModel):
    xp: int
    level: int
    shark_coins: int
    investor_score: int
    accuracy: Optional[float] = None
    total_rounds: int
    total_correct: int
    total_profit: int
    biggest_win: int
    biggest_loss: int
    current_streak: int
    best_streak: int
    play_streak: int
    last_play_date: Optional[date] = None
    persona: Optional[str] = None
    risk_profile: Optional[str] = None

    model_config = {"from_attributes": True}


class PlayerStats(BaseModel):
    investor_score: int
    accuracy: float
    total_rounds: int
    total_correct: int
    total_profit: int
    biggest_win: int
    biggest_loss: int
    current_streak: int
    best_streak: int
    level: int
    xp: int
    persona: Optional[str] = None
    risk_profile: Optional[str] = None


class AchievementOut(BaseModel):
    code: str
    name: str
    description: Optional[str]
    rarity: str
    icon: Optional[str]
    earned_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Products ──────────────────────────────────────────────────────────

class ProductBrief(BaseModel):
    id: UUID
    name: str
    tagline: str
    description: str
    category: str
    difficulty: int
    market_signals: list[str] = []
    tags: list[str] = []
    rarity: str

    model_config = {"from_attributes": True}


class ProductAdmin(BaseModel):
    id: Optional[UUID] = None
    name: str = Field(max_length=100)
    tagline: str = Field(max_length=200)
    description: str
    category: str
    difficulty: int = Field(ge=1, le=5)
    outcome: str = Field(pattern=r"^(success|flop|moderate|breakout)$")
    outcome_multiplier: float = Field(ge=0.0, le=5.0)
    market_signals: list[str] = []
    era: Optional[str] = None
    tags: list[str] = []
    rarity: str = "common"
    humor_level: int = Field(default=0, ge=0, le=5)
    realism: int = Field(default=0, ge=0, le=5)
    is_active: bool = True


class ProductBulkCreate(BaseModel):
    products: list[ProductAdmin]


# ── Game ──────────────────────────────────────────────────────────────

class CreateSessionRequest(BaseModel):
    mode: str = Field(pattern=r"^(classic|streak|daily|head_to_head|speed|themed)$")


class SessionResponse(BaseModel):
    id: UUID
    mode: str
    starting_balance: int
    status: str
    started_at: datetime
    products: list[ProductBrief] = []


class RoundDecision(BaseModel):
    product_id: UUID
    decision: str = Field(pattern=r"^(invest|pass|counter_offer)$")
    investment_amount: Optional[int] = Field(default=None, ge=0)
    nonce: UUID


class RoundResult(BaseModel):
    id: UUID
    round_number: int
    decision: str
    investment_amount: Optional[int]
    outcome_revealed: Optional[str] = None
    outcome_multiplier: Optional[float] = None
    profit_loss: Optional[int] = None
    score_earned: Optional[int] = None
    new_balance: int


class EndSessionResponse(BaseModel):
    session_id: UUID
    final_balance: int
    session_score: int
    total_rounds: int
    correct_rounds: int
    accuracy: float
    xp_earned: int
    shark_coins_earned: int
    achievements_unlocked: list[AchievementOut] = []
    persona_update: Optional[str] = None


# ── Daily Challenge ───────────────────────────────────────────────────

class DailyChallengeResponse(BaseModel):
    id: UUID
    challenge_date: date
    products: list[ProductBrief]
    completed: bool = False


class DailyChallengeSubmit(BaseModel):
    decisions: list[RoundDecision]


class DailyChallengeResult(BaseModel):
    score: int
    correct_count: int
    total_products: int
    rank: Optional[int] = None
    total_players: Optional[int] = None
    xp_earned: int
    streak: int


# ── Leaderboard ──────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: UUID
    username: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    score: int


# ── Friend Challenge ──────────────────────────────────────────────────

class CreateFriendChallengeRequest(BaseModel):
    mode: str = "head_to_head"


class FriendChallengeResponse(BaseModel):
    challenge_code: str
    share_url: str
    challenger_name: str
    mode: str
    starting_balance: int
    product_count: int


class FriendChallengePreview(BaseModel):
    challenge_code: str
    challenger_name: str
    mode: str
    starting_balance: int
    product_count: int
    challenger_score: Optional[int] = None


class FriendChallengeSubmit(BaseModel):
    session_id: UUID
    score: int


class FriendChallengeComparison(BaseModel):
    your_score: int
    challenger_score: int
    you_won: bool
    margin: int
    message: str


# ── Shop ──────────────────────────────────────────────────────────────

class BoosterOut(BaseModel):
    id: UUID
    code: str
    name: str
    description: Optional[str]
    effect_type: str
    rarity: str
    cost_shark_coins: int
    usable_in_daily: bool
    owned_quantity: int = 0

    model_config = {"from_attributes": True}


class BuyBoosterResponse(BaseModel):
    booster: BoosterOut
    shark_coins_remaining: int


# ── Referrals ─────────────────────────────────────────────────────────

class ReferralInfo(BaseModel):
    referral_code: str
    share_url: str
    total_referred: int
    rewards_earned: int


# ── Admin ─────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    daily_active_users: int
    weekly_active_users: int
    total_sessions_today: int
    total_daily_challenges_completed: int
    total_shares: int
    top_product_id: Optional[UUID] = None


# ── Generic ───────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


# Resolve forward reference
TokenResponse.model_rebuild()
