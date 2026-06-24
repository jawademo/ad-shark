# ad-shark — Gameplay Specification

## Overview

This document defines the complete gameplay design for ad-shark v1 (production MVP) through v4 (growth engine). The current prototype implements a simplified version of the Classic Mode only.

---

## 1. Core mechanic

### The decision

Player sees a product pitch. They must decide:

1. **Invest** — commit currency at a chosen level
2. **Pass** — skip this product, no gain or loss

### Product pitch format

Each product card shows:
- Product name
- Tagline / one-liner
- Category badge
- Brief description (2–3 sentences)
- Market signal hints (optional, subtle cues)
- Investment options (slider or quick-select)

### Outcome

Each product has a hidden `outcome`:
- **Success** (multiplier > 1.0): investment returns profit
- **Flop** (multiplier = 0.0): investment is lost
- **Moderate** (multiplier between 0.3–0.9): partial loss
- **Breakout** (multiplier > 3.0): huge win (rare)

Outcomes are pre-determined server-side. No randomness after the product is generated.

---

## 2. Game modes

### 2.1 Classic Mode (v1)

**"Endless investment stream"**

- Infinite products, random order
- Start with $10,000 bankroll
- Each round: invest any amount, pass, or use a booster
- Goal: maximize returns
- Session ends when player quits or bankroll hits 0
- Stats tracked per session and lifetime

**Implementation status:** Prototype exists, needs scoring redesign

### 2.2 Streak Mode (v1)

**"How many in a row can you nail?"**

- 10 rounds, escalating difficulty
- Must decide invest/pass on each
- Score = number of correct decisions
- Perfect score = rare achievement
- Each round: invest amount between $1,000–$50,000 (fixed per round)
- Can't skip (no passing — must decide)

**Implementation status:** Not built

### 2.3 Daily Challenge (v2)

**"Same products. Everyone. One day."**

- 5 curated products each day
- Same products for all players worldwide
- Fixed $10,000 per investment
- Must decide: invest or pass on each
- Results revealed after all 5 decisions
- Daily leaderboard
- Streak: how many days in a row you've played

**Implementation status:** Not built — highest priority viral feature

### 2.4 Head-to-Head (v2)

**"Beat your friend's score"**

- Friend completes a run → generates challenge link
- Recipient gets the same 10 products in the same order
- Same starting bankroll
- Compare scores after completion
- "You beat Sarah by $12,400" or "Sarah still leads by 3 correct picks"

**Implementation status:** Not built

### 2.5 Speed Round (v3)

**"60 seconds. No mercy."**

- Timer counts down from 60 seconds
- Products come rapid-fire
- Quick-invest buttons: $1K, $5K, $10K, ALL IN, PASS
- Score = total profit in the time limit
- Bonus for speed (time remaining)

**Implementation status:** Not built

### 2.6 Themed Packs (v3)

**"Category deep-dives"**

- 20 products in a single category
- E.g., "AI Startups," "Food & Bev," "DTC Brands," "Absurd Meme Products"
- Same mechanics as Classic Mode
- Category mastery tracked separately

**Implementation status:** Not built

---

## 3. Scoring system

### 3.1 Current scoring (prototype)

```
balance += investment * outcome_multiplier  (if success)
balance -= investment  (if fail)
```

Simple. But doesn't create interesting score dynamics.

### 3.2 v1 scoring redesign

**Investor Score** — the primary displayed metric:

```
Investor Score = f(
  total_profit,
  accuracy_rate,
  biggest_win,
  risk_adjusted_return,
  streak_bonus
)
```

**Components:**

| Component | Weight | Description |
|-----------|--------|-------------|
| Total Profit | 40% | Net gain/loss across all rounds |
| Accuracy | 25% | % of investments that were correct |
| Risk Bonus | 15% | Reward for correct high-risk bets |
| Biggest Win | 10% | Single best investment return |
| Streak | 10% | Consecutive correct decisions |

**Display tiers:**

| Score Range | Title |
|-------------|-------|
| 0–999 | Minnow |
| 1,000–4,999 | Piranha |
| 5,000–14,999 | Reef Shark |
| 15,000–49,999 | Bull Shark |
| 50,000–99,999 | Tiger Shark |
| 100,000+ | Great White |

### 3.3 Accuracy rating

Separate from Investor Score:

```
Accuracy = correct_investments / total_investments

Rating:
  90%+  = Oracle
  75–89% = Sharp Eye
  60–74% = Solid Instinct
  45–59% = Coin Flip
  <45%   = Guppy
```

### 3.4 Risk profile

Tracks betting behavior:

```
Avg bet % of bankroll:
  <10%  = Conservative
  10–25% = Balanced
  25–50% = Aggressive
  50%+   = YOLO
```

---

## 4. Progression system

### 4.1 XP and levels

| Action | XP |
|--------|-----|
| Complete a round | 10 XP |
| Correct investment | 25 XP |
| 5-streak correct | 100 XP bonus |
| Daily challenge completed | 150 XP |
| Friend challenge completed | 75 XP |
| First daily play | 50 XP bonus |

| Level | XP Required | Unlock |
|-------|-------------|--------|
| 1 | 0 | Basic products |
| 2 | 200 | Rare products appear |
| 3 | 500 | 1 free booster per day |
| 4 | 1,000 | Advanced stats |
| 5 | 2,000 | "Counter-offer" action unlocked |
| 10 | 10,000 | Legendary products appear |
| 20 | 50,000 | Custom badge |
| 50 | 500,000 | "Shark Tank" title |

### 4.2 Currency

Two currencies:

| Currency | Earned By | Spent On |
|----------|-----------|----------|
| Cash (in-game) | Winning investments | Investing in products |
| Shark Coins | Leveling up, daily bonus, referrals | Boosters, themes, premium packs |

Cash resets per session or mode. Shark Coins are persistent.

### 4.3 Achievements

| Achievement | Requirement | Rarity |
|-------------|-------------|--------|
| First Blood | Complete first investment | Common |
| Hot Streak | 5 correct in a row | Uncommon |
| Perfect 10 | 10/10 correct in Streak Mode | Rare |
| All In | Invest entire bankroll and win | Rare |
| Whale | Single investment over $100K | Rare |
| Daily Grinder | 7-day daily challenge streak | Uncommon |
| Century | 100 total products evaluated | Common |
| Grandmaster | 1,000 total products evaluated | Rare |
| Oracle | 90%+ accuracy over 100+ investments | Legendary |
| Great White | Investor Score 100,000+ | Legendary |
| Social Shark | Share 10 results | Common |
| Referral King | 10 friend signups | Uncommon |

### 4.4 Streaks

- **Play Streak:** Days in a row of playing at least 1 round
- **Daily Challenge Streak:** Days in a row completing the daily challenge
- **Win Streak:** Correct investment decisions in a row (session)

Streak bonuses:
- Day 3: 2x XP
- Day 5: Free booster
- Day 7: Shark Coins bonus
- Day 14: Exclusive theme
- Day 30: Legendary badge

---

## 5. Content taxonomy

### 5.1 Product schema

Each product in the database:

```json
{
  "id": "uuid",
  "name": "string",
  "tagline": "string",
  "description": "string (2–3 sentences)",
  "category": "category_enum",
  "difficulty": 1–5,
  "outcome": "success | flop | moderate | breakout",
  "outcome_multiplier": "float (0.0–5.0)",
  "market_signals": ["string (hints)"],
  "era": "string (optional)",
  "tags": ["string"],
  "rarity": "common | uncommon | rare | legendary",
  "humor_level": 0–5,
  "realism": 0–5,
  "created_by": "admin | community | ai",
  "created_at": "timestamp"
}
```

### 5.2 Categories

| Category | Description | Difficulty Range |
|----------|-------------|------------------|
| AI & Tech | Software, SaaS, AI startups | 2–4 |
| DTC Brands | Direct-to-consumer products | 1–3 |
| Food & Beverage | Restaurants, CPG, food tech | 1–3 |
| Hardware | Physical products, gadgets | 3–5 |
| Health & Wellness | Fitness, mental health, biohacking | 2–4 |
| Finance | Fintech, crypto, investing tools | 3–5 |
| Social Media | Platforms, creator tools | 2–4 |
| Sustainability | Green tech, circular economy | 2–4 |
| Absurd/Meme | Joke products, parody startups | 1–5 |
| Wildcard | Unusual, genre-bending | 4–5 |

### 5.3 Product generation pipeline

1. **Manual creation** — hand-crafted by content team (highest quality)
2. **AI-assisted** — LLM generates draft, human reviews and tunes
3. **Community submissions** — players submit, community votes, admin approves
4. **Trending topics** — products inspired by current events/memes

### 5.4 Difficulty design

Difficulty is about how ambiguous the pitch is — not how good the product is.

| Level | Description | Giveaway Rate |
|-------|-------------|---------------|
| 1 | Obvious winner or obvious flop | 90% obvious |
| 2 | Mostly clear with one twist | 70% clear |
| 3 | Balanced signals, could go either way | 50/50 feel |
| 4 | Deceptive — looks good but isn't (or vice versa) | 30% clear |
| 5 | Nearly impossible — requires deep knowledge or luck | <20% clear |

### 5.5 Content volume targets

| Milestone | Products | Goal |
|-----------|----------|------|
| Alpha launch | 100 | Never repeat in a single session |
| Beta launch | 300 | Week of daily challenges without repeats |
| Public launch | 500 | Enough variety for regular players |
| Scale | 1,000+ | Full category depth |

---

## 6. Boosters (Shop)

Boosters are consumable power-ups purchasable with Shark Coins.

| Booster | Effect | Cost | Rarity |
|---------|--------|------|--------|
| Market Intel | Reveals one hidden signal about the product | 50 SC | Common |
| Second Chance | Re-do one investment decision after seeing the result | 150 SC | Uncommon |
| Double Down | 2x profit on next successful investment | 100 SC | Uncommon |
| Safety Net | Next failed investment returns 50% of capital | 200 SC | Rare |
| Insider Info | Reveals the outcome before investing | 500 SC | Legendary |
| Category Expert | Bonus accuracy for one category (passive) | 300 SC | Rare |

**Balance rules:**
- Max 3 boosters active at once
- Legendary items have cooldowns
- Boosters do not work in Daily Challenge (keeps it fair)

---

## 7. Personas (identity system)

After enough play history, assign a persona. These are for sharing and identity, not gameplay.

| Persona | Trigger |
|---------|---------|
| Chaos Capitalist | High risk, high variance |
| Safe Shark | Conservative, consistent |
| Hype Chaser | Invests in high-humor, low-realism products |
| Pattern Hunter | High accuracy on difficult products |
| Contrarian | Correctly passes when others would invest |
| Meme Lord | Excels at absurd product category |
| Data Nerd | Low humor, high realism preference |
| Lucky Fish | High returns, low accuracy (variance favored) |
| Ghost | Passes too often, misses opportunities |
| Whale | Makes huge bets |

---

## 8. Anti-cheat design

Rules enforced server-side:

1. **Outcome validation:** Server generates and stores the outcome before the player decides
2. **Rate limiting:** Max N requests per second
3. **Score verification:** Server recalculates score, rejects client-submitted scores
4. **Replay detection:** Nonce per round prevents replay attacks
5. **Anomaly detection:** Flag impossible score trajectories (e.g., 100% accuracy on difficulty-5 products)

---

## 9. Accessibility

- All game-critical info available as text (not just color)
- Sufficient color contrast ratios
- Screen reader support for product cards
- Reduced motion option (disables Framer Motion animations)
- Keyboard navigation for desktop
- Touch targets ≥ 44px on mobile

---

*Version: 1.0 | Status: Draft | Next: Technical architecture*
