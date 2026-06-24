# ad-shark — Technical Architecture

## Overview

ad-shark transitions from a frontend-only prototype to a full-stack production application. This document defines the complete technical architecture.

---

## 1. Stack decisions

### Frontend (existing, to be hardened)
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React 19 + Vite 8 | Already in place, fast dev, excellent production builds |
| Language | JavaScript → TypeScript (migrate) | Type safety for production |
| State | Zustand 5 | Already in place, lightweight, works well |
| Styling | Tailwind CSS v4 | Already in place |
| Animation | Framer Motion | Already in place |
| Routing | React Router v7 (added) | Needed for landing page + app + share pages |
| PWA | Vite PWA plugin | Install prompts, offline support |
| HTTP | fetch + React Query (TanStack) | Caching, retry, stale management |
| Forms | React Hook Form + Zod | Validation |

### Backend
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | FastAPI (Python 3.12+) | Shared across all projects, async, fast |
| ORM | SQLAlchemy 2.0 + Alembic | Mature, shared stack |
| Auth | JWT (python-jose) + OAuth2 | Simple, no third-party dependency at start |
| Validation | Pydantic v2 | Built into FastAPI |
| Tasks | Celery + Redis | Background jobs (daily challenge gen, analytics) |
| Cache | Redis | Leaderboards, rate limiting, session cache |
| Storage | S3 / Cloudflare R2 | Share card images, static assets |

### Database
| Layer | Choice | Reason |
|-------|--------|--------|
| Primary DB | PostgreSQL 16 | Shared stack, PostGIS not needed here |
| Cache | Redis | Leaderboards, sessions |

### Infrastructure
| Layer | Choice | Reason |
|-------|--------|--------|
| Hosting | Render / Railway (start) → AWS/GCP (scale) | Low-friction start |
| CDN | Cloudflare | Free tier, global |
| CI/CD | GitHub Actions | Free for public repos |
| Monitoring | Sentry | Error tracking |
| Analytics | PostHog (self-host or cloud) | Product analytics, feature flags |
| Logs | Stdout → provider aggregation | Simple, scalable |
| Domain | adshark.io or ad-shark.com | TBD |

---

## 2. Database schema

### 2.1 Entity-Relationship overview

```
users ──┬── game_sessions ──┬── session_rounds
        │                    │
        │   ┌────────────────┘
        │   │
        ├── daily_challenge_participations
        │
        ├── user_achievements
        │
        ├── referrals (self-referential on users)
        │
        ├── user_boosters (inventory)
        │
        └── user_profiles (1:1 extension)

products ──┬── daily_challenges (daily sets)
           │
           ├── product_categories
           │
           └── session_rounds (each round references a product)

leaderboard_entries
```

### 2.2 Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),  -- nullable for OAuth
    display_name VARCHAR(50),
    avatar_url TEXT,
    auth_provider VARCHAR(20) DEFAULT 'email',  -- email | google | apple
    auth_provider_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    last_login_at TIMESTAMPTZ,
    is_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    shark_coins INTEGER DEFAULT 0,
    investor_score BIGINT DEFAULT 0,
    accuracy DECIMAL(5,2),
    total_rounds INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_profit BIGINT DEFAULT 0,
    biggest_win BIGINT DEFAULT 0,
    biggest_loss BIGINT DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    play_streak INTEGER DEFAULT 0,
    last_play_date DATE,
    persona VARCHAR(50),
    risk_profile VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### products
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tagline VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('success','flop','moderate','breakout')),
    outcome_multiplier DECIMAL(4,2) NOT NULL,
    market_signals JSONB DEFAULT '[]',
    era VARCHAR(50),
    tags JSONB DEFAULT '[]',
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common','uncommon','rare','legendary')),
    humor_level INTEGER CHECK (humor_level BETWEEN 0 AND 5),
    realism INTEGER CHECK (realism BETWEEN 0 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_difficulty ON products(difficulty);
CREATE INDEX idx_products_rarity ON products(rarity);
CREATE INDEX idx_products_active ON products(is_active);
```

#### game_sessions
```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('classic','streak','daily','head_to_head','speed','themed')),
    challenge_id UUID,  -- FK to daily_challenges or friend_challenges
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    starting_balance BIGINT NOT NULL,
    ending_balance BIGINT,
    total_rounds INTEGER DEFAULT 0,
    correct_rounds INTEGER DEFAULT 0,
    session_score BIGINT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','abandoned'))
);

CREATE INDEX idx_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_sessions_mode ON game_sessions(mode);
CREATE INDEX idx_sessions_status ON game_sessions(status);
```

#### session_rounds
```sql
CREATE TABLE session_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id),
    product_id UUID NOT NULL REFERENCES products(id),
    round_number INTEGER NOT NULL,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('invest','pass','counter_offer')),
    investment_amount BIGINT,
    booster_used UUID REFERENCES user_boosters(id),  -- nullable
    outcome_revealed VARCHAR(20),
    outcome_multiplier DECIMAL(4,2),
    profit_loss BIGINT,
    score_earned INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    nonce UUID NOT NULL  -- anti-replay
);

CREATE INDEX idx_rounds_session ON session_rounds(session_id);
```

#### daily_challenges
```sql
CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE UNIQUE NOT NULL,
    product_ids UUID[] NOT NULL,  -- array of 5 product UUIDs
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);
```

#### daily_challenge_participations
```sql
CREATE TABLE daily_challenge_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    challenge_id UUID NOT NULL REFERENCES daily_challenges(id),
    session_id UUID NOT NULL REFERENCES game_sessions(id),
    score INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, challenge_id)
);
```

#### friend_challenges
```sql
CREATE TABLE friend_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID NOT NULL REFERENCES users(id),
    challenge_code VARCHAR(8) UNIQUE NOT NULL,  -- short shareable code
    mode VARCHAR(20) DEFAULT 'head_to_head',
    product_ids UUID[] NOT NULL,
    starting_balance BIGINT NOT NULL,
    challenger_score BIGINT,
    challenger_session_id UUID REFERENCES game_sessions(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    times_played INTEGER DEFAULT 0
);
```

#### leaderboard_entries
```sql
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    leaderboard_type VARCHAR(20) NOT NULL CHECK (leaderboard_type IN ('daily','weekly','all_time','category','mode')),
    leaderboard_key VARCHAR(50),  -- 'daily:2024-06-15', 'weekly:2024-W24', 'all_time', 'category:ai_tech'
    score BIGINT NOT NULL,
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, leaderboard_type, leaderboard_key)
);
```

#### achievements
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'hot_streak', 'perfect_10'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) NOT NULL,
    icon VARCHAR(50),
    xp_reward INTEGER DEFAULT 0,
    shark_coin_reward INTEGER DEFAULT 0
);
```

#### user_achievements
```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);
```

#### boosters
```sql
CREATE TABLE boosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    effect_type VARCHAR(50) NOT NULL,
    effect_value DECIMAL(5,2),
    rarity VARCHAR(20) NOT NULL,
    cost_shark_coins INTEGER NOT NULL,
    max_active INTEGER DEFAULT 1,
    cooldown_minutes INTEGER,
    usable_in_daily BOOLEAN DEFAULT false
);
```

#### user_boosters
```sql
CREATE TABLE user_boosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    booster_id UUID NOT NULL REFERENCES boosters(id),
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMPTZ DEFAULT now()
);
```

#### referrals
```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_user_id UUID UNIQUE REFERENCES users(id),
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','signed_up','played','rewarded')),
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    event_properties JSONB,
    session_id UUID,
    timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_type_time ON analytics_events(event_type, timestamp);
```

---

## 3. API contracts

### 3.1 Auth

```
POST   /api/auth/register        { email, username, password } → { access_token, user }
POST   /api/auth/login            { email, password } → { access_token, user }
POST   /api/auth/logout           → 204
GET    /api/auth/me               → { user + profile }
PUT    /api/auth/me               { display_name, avatar_url } → { user }
```

### 3.2 Game

```
POST   /api/game/sessions             { mode } → { session_id, products: [...] }
GET    /api/game/sessions/{id}        → { session details }
POST   /api/game/sessions/{id}/rounds  { product_id, decision, investment, nonce } → { outcome, profit_loss, score }
GET    /api/game/sessions/{id}/rounds  → [rounds]
POST   /api/game/sessions/{id}/end    → { final_score, xp_earned, achievements: [...] }
```

### 3.3 Daily Challenge

```
GET    /api/challenges/daily             → { challenge (today's or null if completed) }
POST   /api/challenges/daily/start       → { session_id, products }
POST   /api/challenges/daily/{id}/submit  { decisions[] } → { results, score, rank }
GET    /api/challenges/daily/{date}/leaderboard → [{ user, score, rank }]
GET    /api/challenges/daily/streak      → { current_streak }
```

### 3.4 Leaderboard

```
GET    /api/leaderboard?type=daily&key=YYYY-MM-DD → [{ rank, user, score }]
GET    /api/leaderboard?type=weekly&key=YYYY-Www  → [{ rank, user, score }]
GET    /api/leaderboard?type=all_time             → [{ rank, user, score }]
GET    /api/leaderboard?type=category&key=slug     → [{ rank, user, score }]
```

### 3.5 Social / Sharing

```
POST   /api/challenges/friends           { mode } → { challenge_code, share_url }
GET    /api/challenges/friends/{code}    → { challenger_name, mode, starting_balance }
POST   /api/challenges/friends/{code}/accept → { session_id, products }
POST   /api/challenges/friends/{code}/submit { session_id, score } → { comparison }
```

### 3.6 Profile / Progression

```
GET    /api/profile               → { user_profile, stats, achievements, personas }
GET    /api/profile/achievements  → [{ achievement, earned_at }]
GET    /api/profile/stats         → { detailed stats }
```

### 3.7 Shop

```
GET    /api/shop/boosters         → [{ booster, owned_quantity }]
POST   /api/shop/boosters/{id}/buy → { updated_inventory, shark_coins_remaining }
```

### 3.8 Referrals

```
GET    /api/referrals/code        → { referral_code, share_url, stats }
POST   /api/referrals/claim/{code} → { reward }
```

### 3.9 Admin

```
GET    /api/admin/products            → [products] (paginated)
POST   /api/admin/products            { product_data } → { product }
PUT    /api/admin/products/{id}       { product_data } → { product }
DELETE /api/admin/products/{id}       → 204
POST   /api/admin/products/bulk       { products[] } → { created_count }
POST   /api/admin/challenges/generate { date } → { challenge }
GET    /api/admin/stats               → { DAU, retention, shares, etc }
```

---

## 4. Auth approach

### Phase 1: Simple JWT
- Email + password registration
- JWT access tokens (15 min) + refresh tokens (7 days)
- Stored in httpOnly cookie (primary) + Authorization header fallback

### Phase 2: Social auth
- Google OAuth
- Apple Sign In (for iOS PWA)
- Link multiple providers to same account

### Anti-abuse
- Rate limit registration (3/hour/IP)
- Rate limit login attempts (10/minute/IP)
- Rate limit game API (60 requests/minute)
- Account lockout after 10 failed attempts (30 min)

---

## 5. Project structure

```
ad-shark/
├── frontend/              # current src/ moved here
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── screens/       # page-level components
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # custom hooks
│   │   ├── services/      # API client, product logic
│   │   ├── lib/           # utilities
│   │   ├── types/         # TypeScript types
│   │   └── assets/        # images, icons, fonts
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app entry
│   │   ├── config.py      # settings
│   │   ├── database.py    # DB connection
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── api/           # route handlers
│   │   │   ├── auth.py
│   │   │   ├── game.py
│   │   │   ├── challenges.py
│   │   │   ├── leaderboard.py
│   │   │   ├── social.py
│   │   │   ├── profile.py
│   │   │   ├── shop.py
│   │   │   ├── referrals.py
│   │   │   └── admin.py
│   │   ├── services/      # business logic
│   │   │   ├── scoring.py
│   │   │   ├── matchmaking.py
│   │   │   ├── persona.py
│   │   │   └── content.py
│   │   ├── middleware/     # auth, rate limit, logging
│   │   └── tasks/         # Celery tasks
│   ├── tests/
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docs/
│   ├── PRODUCT_BRIEF.md
│   ├── GAMEPLAY_SPEC.md
│   └── TECH_ARCHITECTURE.md
│
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

---

## 6. Deployment pipeline

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | localhost:5173 + localhost:8000 | Development |
| Preview | *.preview.adshark.io | PR previews |
| Staging | staging.adshark.io | Pre-release testing |
| Production | adshark.io | Live |

### CI/CD (GitHub Actions)

```
PR opened → lint + typecheck + test
PR merged to main → deploy staging
Release tag → deploy production
```

### Infrastructure provisioning

**Phase 1 (Render/Railway):**
- Backend: Web service (FastAPI)
- DB: Managed PostgreSQL
- Redis: Managed Redis
- Frontend: Static site (Vite build) with CDN

**Phase 2 (if scaling needed):**
- Move to AWS ECS or GCP Cloud Run
- RDS PostgreSQL
- ElastiCache Redis

---

## 7. Analytics & experimentation

### Event taxonomy

```
Core events (always tracked):
  user_signed_up
  user_logged_in
  game_session_started { mode }
  game_round_completed { decision, outcome, profit_loss }
  game_session_ended { mode, final_score, rounds, correct }
  daily_challenge_completed { score, correct_count }
  daily_challenge_started
  share_clicked { share_type, platform }
  challenge_link_created
  challenge_link_accepted { source }
  booster_purchased { booster_code }
  level_up { new_level }
  achievement_earned { achievement_code }

Growth events:
  referral_code_copied
  referral_signup_completed
  landing_page_viewed
  app_opened
```

### Funnels

```
Landing → Sign Up → First Session → First Round → Session End
                                                → Share Click
                                                → Daily Challenge Entry
```

### Retention cohorts

Track D1, D3, D7, D14, D30 retention by:
- Acquisition source
- First session mode
- First session score
- Device type
- Country

### Experiment framework

Feature flags via PostHog:
- Onboarding variant A/B
- Share prompt timing
- Scoring display format
- Difficulty tuning
- Booster pricing

---

## 8. Security checklist

- [ ] JWT with short-lived access tokens
- [ ] Refresh token rotation
- [ ] Password hashing (bcrypt/argon2)
- [ ] Rate limiting on all public endpoints
- [ ] CORS configured for production domains
- [ ] CSP headers
- [ ] HTTPS only
- [ ] SQL injection prevention (parameterized queries via SQLAlchemy)
- [ ] Input validation (Pydantic)
- [ ] Anti-cheat: server-side outcome validation
- [ ] Anti-cheat: nonce per round
- [ ] Anti-cheat: score anomaly detection
- [ ] Secrets in environment variables, never committed
- [ ] Dependency auditing (pip-audit, npm audit)
- [ ] No user PII in logs
- [ ] GDPR: account deletion endpoint
- [ ] GDPR: data export endpoint

---

*Version: 1.0 | Status: Draft | Next: Backend implementation*
