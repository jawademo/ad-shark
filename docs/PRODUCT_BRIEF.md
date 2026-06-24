# ad-shark — Product Brief

## Elevator pitch

A fast, addictive mobile game where players evaluate products and decide whether to invest — building their reputation as a shark who can spot winners and dodge flops.

---

## Positioning

### What is it?

A casual social game that simulates the thrill of angel investing. Players swipe through product pitches, make investment decisions under uncertainty, and build a track record. The game is designed to be played in 2–5 minute sessions, with a daily challenge that brings everyone back.

### What is it NOT?

- Not a financial education app (though there's incidental learning)
- Not a real investment simulator
- Not a marketplace
- Not a portfolio tracker

### The core hook

**"Can you spot the next unicorn — or will you pour money into a flop?"**

The emotional loop: tension (evaluate a pitch) → decision (invest or pass) → payoff (validation or regret) → share (compare with friends).

---

## Target audience

### Primary: Casual gamers + startup-curious (18–35)

- Active on TikTok, Instagram, X/Twitter
- Familiar with startup culture memes
- Enjoys quick-hit mobile games
- Shares scores and results socially
- Competitive with friends

### Secondary: Startup ecosystem people

- Founders, VCs, angels, operators
- Use the game as a conversation starter
- May become content creators or sponsors later

### Anti-audience

- Traditional "mobile gamers" expecting deep progression systems
- People looking for financial advice
- Anyone expecting a simulation of real venture capital

---

## Brand tone

| Dimension | Direction |
|-----------|-----------|
| Voice | Confident, playful, slightly cocky. "Shark" energy without being mean. |
| Humor | Dry, startup-meme-adjacent. Knows the tropes. |
| Visual | Dark, premium, fast. Neon accents. Clean typography. |
| Energy | High-tempo, snappy transitions, instant feedback. |

The name "ad-shark" implies sharp instincts — someone who smells opportunity (or danger) before anyone else.

---

## Game session loop

```
Open app
  ↓
[If new day] → Daily Challenge available
  ↓
Play round: see product pitch → invest/pass → see result
  ↓
Repeat (5-20 rounds per session)
  ↓
End session: see stats, persona update, share prompt
  ↓
Close or play again
```

Target session length: **2–5 minutes**

---

## Progression loop

```
Play rounds → earn XP + currency
  ↓
Level up → unlock new product categories
  ↓
Hit milestones → earn badges + achievements
  ↓
Daily streak → bonus rewards
  ↓
Leaderboard rank → social status
```

---

## Viral / share loop

```
Play → get result (score, streak, persona)
  ↓
See share prompt ("Only 8% of players beat this score")
  ↓
Share card to social / send challenge link to friend
  ↓
Friend opens challenge link → plays same products
  ↓
Friend sees comparison → shares their result
  ↓
Viral loop continues
```

---

## Monetization hypothesis

### Phase 1 (no monetization)
- Focus entirely on growth and retention
- No ads, no IAP, no friction

### Phase 2 (cosmetic + convenience)
- Premium themes / visual packs
- Advanced stats dashboard
- Remove daily play limits (if any)
- Custom badge display

### Phase 3 (sponsorship)
- Branded product packs ("Can you spot the real Airbnb?")
- Creator-sponsored challenges
- Startup launch pack partnerships

### Never
- Pay-to-win mechanics
- Forced interstitial ads
- Blocking core gameplay behind paywall

---

## Success metrics (north star)

**DAU × share rate × invite conversion = viral coefficient**

Supporting metrics:
- D1 / D7 / D30 retention
- Sessions per day per user
- Rounds per session
- Share button click rate
- Challenge link open rate
- New user conversion from challenge links
- Daily challenge completion rate
- Leaderboard participation rate

---

## Competitive landscape

### Direct competitors
- None exact — the "invest or pass on products" format is novel

### Adjacent competitors
- Higher/Lower games (simple binary guessing)
- Trivia games (daily challenge + social)
- Stock market simulators (too complex, wrong vibe)
- Wordle (daily challenge format inspiration)
- HQ Trivia (live event energy inspiration)

### Our advantage
- Unique product evaluation mechanic
- Startup culture relevancy
- High shareability (results are identity-revealing)
- Fast session time fits mobile behavior

---

## Platform strategy

### Launch: Mobile web (PWA-capable)
- No app store friction
- Instant share via URL
- Lower barrier to try

### Future: Native mobile apps
- React Native or PWA wrapping
- Push notifications
- Deeper OS integration
- App Store / Play Store presence

---

## Key decisions made

| Decision | Choice |
|----------|--------|
| Primary identity | Casual social game |
| Core mechanic | Evaluate products, invest or pass |
| Session length | 2–5 minutes |
| Monetization timing | After growth validated |
| Backend | FastAPI + PostgreSQL (shared stack) |
| Frontend | React + Vite (existing, hardened) |
| Share mechanic | Challenge links + persona cards |
| Retention anchor | Daily challenge + streaks |
| Content strategy | Curated + AI-assisted, admin-reviewed |

---

## Risks to validate

1. **"Is the core loop fun after 10 plays?"** → Test with real users quickly
2. **"Will people actually share?"** → Build share MVP and measure conversion
3. **"Can we make enough good content?"** → 100 products minimum before alpha
4. **"Will daily challenge sustain retention?"** → Monitor D7/D30 retention after challenge launch
5. **"Is the audience big enough?"** → Validate with small paid acquisition test

---

*Version: 1.0 | Status: Draft | Next: Gameplay spec*
