import { create } from "zustand";

// ── Persistent player profile (skill metrics) ─────────────────
// This is the "how good are you" spine: lifetime P&L, accuracy, streaks,
// Investor Score and shark tier. It is intentionally separate from the
// Office store, which is the "what you do with your winnings" meta — Office
// spends positive earnings on cosmetics, this measures skill. There is no
// double-counting: Office tracks cumulative *positive* earnings, this tracks
// net P&L plus decision quality.

const STORAGE_KEY = "adshark_stats";

// Shark tiers (primary identity, derived from Investor Score) — docs §3.2
const SHARK_TIERS = [
  { min: 100000, title: "Great White" },
  { min: 50000, title: "Tiger Shark" },
  { min: 15000, title: "Bull Shark" },
  { min: 5000, title: "Reef Shark" },
  { min: 1000, title: "Piranha" },
  { min: 0, title: "Minnow" },
];

// Accuracy ratings — docs §3.3
function accuracyRating(accuracy, totalInvestments) {
  if (totalInvestments < 1) return "Unrated";
  if (accuracy >= 0.9) return "Oracle";
  if (accuracy >= 0.75) return "Sharp Eye";
  if (accuracy >= 0.6) return "Solid Instinct";
  if (accuracy >= 0.45) return "Coin Flip";
  return "Guppy";
}

// Risk profile from avg bet % of bankroll — docs §3.4
function riskProfile(avgBetFraction, totalInvestments) {
  if (totalInvestments < 1) return "Unknown";
  const pct = avgBetFraction;
  if (pct >= 0.5) return "YOLO";
  if (pct >= 0.25) return "Aggressive";
  if (pct >= 0.1) return "Balanced";
  return "Conservative";
}

function sharkTier(investorScore) {
  return SHARK_TIERS.find((t) => investorScore >= t.min)?.title || "Minnow";
}

// Investor Score — weighted blend (docs §3.2: profit 40 / accuracy 25 /
// risk 15 / biggest win 10 / streak 10). Cumulative so it grows with play
// and maps onto the shark-tier ranges.
function investorScore(s) {
  const totalInvestments = s.totalInvestments || 0;
  const accuracy = totalInvestments ? s.correctInvestments / totalInvestments : 0;
  const profitPts = Math.max(0, s.totalProfit);
  const accuracyPts = accuracy * totalInvestments * 200;
  const riskPts = (s.riskWins || 0) * 500;
  const bigWinPts = Math.max(0, s.biggestWin || 0);
  const streakPts = Math.pow(s.bestStreak || 0, 2) * 100;
  return Math.round(
    0.4 * profitPts +
      0.25 * accuracyPts +
      0.15 * riskPts +
      0.1 * bigWinPts +
      0.1 * streakPts
  );
}

const EMPTY = {
  totalProfit: 0,
  totalRounds: 0, // deals evaluated (any decision)
  totalInvestments: 0, // invest decisions only
  correctInvestments: 0, // invest decisions that won
  riskWins: 0, // won bets that risked >25% of bankroll
  biggestWin: 0, // single best net gain
  currentStreak: 0, // consecutive winning investments
  bestStreak: 0,
  sumBetFraction: 0, // for avg bet % → risk profile
  xp: 0,
};

function loadRaw() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...EMPTY, ...JSON.parse(saved) };
  } catch { /* ignore corrupt storage */ }
  return { ...EMPTY };
}

function saveRaw(raw) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  } catch { /* ignore write failure */ }
}

// Pure computed snapshot — shape matches what StatsScreen reads.
export function getStatsSnapshot() {
  const raw = loadRaw();
  const accuracy = raw.totalInvestments
    ? raw.correctInvestments / raw.totalInvestments
    : 0;
  const avgBetFraction = raw.totalInvestments
    ? raw.sumBetFraction / raw.totalInvestments
    : 0;
  const score = investorScore(raw);
  const level = Math.floor((raw.xp || 0) / 200) + 1;
  return {
    investor_score: score,
    accuracy,
    total_profit: raw.totalProfit,
    total_rounds: raw.totalRounds,
    biggest_win: raw.biggestWin,
    current_streak: raw.currentStreak,
    best_streak: raw.bestStreak,
    level,
    xp: raw.xp,
    persona: sharkTier(score), // primary identity = shark tier
    accuracy_rating: accuracyRating(accuracy, raw.totalInvestments),
    risk_profile: riskProfile(avgBetFraction, raw.totalInvestments),
  };
}

const useStatsStore = create((set, get) => ({
  ...loadRaw(),

  getSnapshot: () => getStatsSnapshot(),

  // Called once per resolved round from the game loop.
  recordRound: ({ decision, won, profitLoss = 0, betFraction = 0 }) => {
    const s = get();
    const isInvest = decision === "invest";

    let xpGain = 10; // every round
    let currentStreak = s.currentStreak;

    if (isInvest) {
      if (won) {
        currentStreak = s.currentStreak + 1;
        xpGain += 25; // correct investment
        if (currentStreak > 0 && currentStreak % 5 === 0) xpGain += 100; // 5-streak bonus
      } else {
        currentStreak = 0; // a losing bet breaks the streak
      }
    }
    // a pass leaves the streak unchanged (neutral)

    const next = {
      totalProfit: s.totalProfit + profitLoss,
      totalRounds: s.totalRounds + 1,
      totalInvestments: s.totalInvestments + (isInvest ? 1 : 0),
      correctInvestments: s.correctInvestments + (isInvest && won ? 1 : 0),
      riskWins: s.riskWins + (isInvest && won && betFraction > 0.25 ? 1 : 0),
      biggestWin: isInvest && won ? Math.max(s.biggestWin, profitLoss) : s.biggestWin,
      currentStreak,
      bestStreak: Math.max(s.bestStreak, currentStreak),
      sumBetFraction: s.sumBetFraction + (isInvest ? betFraction : 0),
      xp: s.xp + xpGain,
    };

    saveRaw(next);
    set(next);
  },

  reset: () => {
    saveRaw({ ...EMPTY });
    set({ ...EMPTY });
  },
}));

export default useStatsStore;
