// Demo-mode API client — works fully client-side with no backend.
// Falls back to mock data for everything.
// When VITE_API_URL is set, it will try the real backend first.
//
// All player-facing content (product pitches, outcomes, boosters, signals) is
// pulled from the bilingual catalog in ../i18n/gameContent.js, selected by the
// current language (../i18n/lang.js) at call time — so switching language
// re-localizes new sessions/rounds without touching this module.

import { getStatsSnapshot } from "../store/statsStore.js";
import { getLang } from "../i18n/lang.js";
import {
  CATEGORY_LABELS,
  TAGLINES,
  GREEN_FLAGS,
  RED_FLAGS,
  getAbsurdProducts,
  OUTCOMES,
  FLAVOR,
  SIGNAL_WORDS,
  getBoosters,
  fill,
} from "../i18n/gameContent.js";

const API_BASE = import.meta.env.VITE_API_URL || "";

// ── Product generation (local, no server) ──────────────────
// Emoji/color/subcategories are language-neutral; the displayed label comes
// from CATEGORY_LABELS keyed by the current language.

const CATEGORIES = {
  app: { emoji: "📱", color: "#6366f1", subcategories: ["Productivity", "Social", "Gaming", "Fitness", "Finance", "Dating", "Education", "Shopping"] },
  gadget: { emoji: "🔧", color: "#06b6d4", subcategories: ["Wearable", "Smart Home", "Accessory", "Health Tech", "Audio"] },
  food: { emoji: "🍔", color: "#f59e0b", subcategories: ["Snack", "Beverage", "Health Food", "Fast Food", "Supplement"] },
  service: { emoji: "⚡", color: "#10b981", subcategories: ["Subscription", "On-Demand", "B2B SaaS", "Marketplace", "Delivery"] },
  fashion: { emoji: "👟", color: "#ec4899", subcategories: ["Streetwear", "Athleisure", "Accessories", "Sustainable", "Luxury"] },
};

const ADJECTIVES = ["Ultra", "Hyper", "Super", "Nano", "Mega", "Smart", "AI", "Turbo", "Zen", "Flux", "Neo", "Vibe", "Peak", "Core", "Pure", "Swift", "Bold", "Nova"];
const NOUNS_APP = ["Pulse", "Flow", "Snap", "Sync", "Boost", "Track", "Link", "Hub", "Nest", "Glow", "Stack", "Loop", "Dash", "Vault", "Spark"];
const NOUNS_GADGET = ["Band", "Clip", "Ring", "Dot", "Cube", "Pad", "Lens", "Pod", "Tag", "Beam", "Bolt", "Node", "Chip"];
const NOUNS_FOOD = ["Bar", "Drops", "Bites", "Brew", "Blend", "Shot", "Crunch", "Sip", "Munch", "Fuel"];
const NOUNS_SERVICE = ["Pass", "Pro", "Plus", "Club", "Circle", "Network", "Crew", "Suite", "Hub", "Base"];
const NOUNS_FASHION = ["Kicks", "Fit", "Drop", "Layer", "Edge", "Cut", "Thread", "Weave", "Form"];

const NOUN_MAP = { app: NOUNS_APP, gadget: NOUNS_GADGET, food: NOUNS_FOOD, service: NOUNS_SERVICE, fashion: NOUNS_FASHION };

const TARGET_MARKETS = ["Gen Z (18-24)", "Millennials (25-35)", "Busy parents", "Remote workers", "Gym enthusiasts", "College students", "Small business owners", "Gamers", "Health-conscious adults", "Tech early adopters", "Freelancers", "Pet owners"];

const PRICE_RANGES = {
  app: ["Free (ads)", "$2.99/mo", "$9.99/mo", "$0.99 one-time", "$19.99/yr"],
  gadget: ["$29", "$49", "$79", "$129", "$249", "$399"],
  food: ["$2.99", "$4.99", "$8.99", "$24.99 (12-pack)", "$39.99 (subscription)"],
  service: ["$9/mo", "$19/mo", "$49/mo", "$99/mo", "$299/yr"],
  fashion: ["$29", "$59", "$89", "$149", "$249"],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

function generateRandomProduct() {
  const lang = getLang();
  const categoryKey = pick(Object.keys(CATEGORIES));
  const category = CATEGORIES[categoryKey];
  const categoryLabel = CATEGORY_LABELS[categoryKey][lang] || CATEGORY_LABELS[categoryKey].en;
  const nouns = NOUN_MAP[categoryKey];
  const name = `${pick(ADJECTIVES)}${pick(nouns)}`;
  const tagline = pick(TAGLINES[lang][categoryKey]);
  const subcategory = pick(category.subcategories);
  const targetMarket = pick(TARGET_MARKETS);
  const price = pick(PRICE_RANGES[categoryKey]);
  const hypeScore = Math.floor(Math.random() * 10) + 1;
  const totalSignals = 2 + Math.floor(Math.random() * 3);
  const greenCount = hypeScore >= 7 ? Math.ceil(totalSignals * 0.75) : hypeScore >= 4 ? Math.ceil(totalSignals * 0.5) : Math.floor(totalSignals * 0.25);
  const redCount = totalSignals - greenCount;
  const signals = [
    ...pickN(GREEN_FLAGS[lang], greenCount).map(s => ({ text: s, type: "green" })),
    ...pickN(RED_FLAGS[lang], redCount).map(s => ({ text: s, type: "red" })),
  ].sort(() => Math.random() - 0.5);
  const successProb = hypeScore >= 7 ? 0.70 + (hypeScore - 7) * 0.05 : hypeScore >= 4 ? 0.35 + (hypeScore - 4) * 0.05 : 0.10 + (hypeScore - 1) * 0.05;
  const returnMultiplier = 1.2 + (hypeScore / 10) * 4;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name, tagline, categoryKey, categoryLabel, categoryEmoji: category.emoji,
    categoryColor: category.color, subcategory, targetMarket, price, signals,
    hypeScore, successProb, returnMultiplier,
    // ProductCard compatibility
    description: tagline,
    category: categoryLabel,
    rarity: hypeScore >= 8 ? "legendary" : hypeScore >= 6 ? "rare" : hypeScore >= 4 ? "uncommon" : "common",
    difficulty: Math.min(5, Math.ceil(hypeScore / 2)),
    market_signals: signals.map(s => s.text),
  };
}

// ── Session simulation (local, no server) ─────────────────────

function createLocalSession(mode = "classic") {
  const memes = getAbsurdProducts(getLang());
  const products = [];
  for (let i = 0; i < 5; i++) {
    // 80% chance to use a meme product, 20% random
    if (Math.random() < 0.8 && memes.length > 0) {
      const meme = memes[Math.floor(Math.random() * memes.length)];
      products.push({ ...meme, id: `${meme.id}-${i}-${Date.now()}` });
    } else {
      products.push(generateRandomProduct());
    }
  }
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    mode,
    starting_balance: 10000,
    products,
  };
}

// Daily challenge set — a fixed selection of memes, localized to the current language.
function dailyChallengeSet() {
  const memes = getAbsurdProducts(getLang());
  return [memes[0], memes[7], memes[9], memes[13], memes[19]].map((p, i) => ({ ...p, id: `daily-${i}` }));
}

// ── Outcome "why" helpers ─────────────────────────────────────
// Keyword heuristics used to pick the signal that "decided" a round when a
// product's market_signals are plain strings (curated meme products). Typed
// signals (generated products) are classified directly by their green/red type.

function scoreSignal(text) {
  const words = SIGNAL_WORDS[getLang()] || SIGNAL_WORDS.en;
  const t = (text || "").toLowerCase();
  let score = 0;
  for (const w of words.green) if (t.includes(w)) score += 1;
  for (const w of words.red) if (t.includes(w)) score -= 1;
  return score;
}

// The single signal the player saw that best explains the outcome.
function decisiveSignal(product, success) {
  if (Array.isArray(product.signals) && product.signals.length) {
    const want = success ? "green" : "red";
    const match = product.signals.filter(s => s.type === want);
    const pool = match.length ? match : product.signals;
    return pick(pool).text;
  }
  const signals = product.market_signals || [];
  if (!signals.length) return null;
  const scored = signals.map(text => ({ text, score: scoreSignal(text) }));
  scored.sort((a, b) => (success ? b.score - a.score : a.score - b.score));
  return scored[0].text;
}

// Why it won/crashed. Prefers an authored verdict; otherwise calls back to
// the decisive signal so every product still gets a coherent explanation.
function verdictReason(product, success, signal) {
  const flavor = FLAVOR[getLang()] || FLAVOR.en;
  const authored = product.verdict && product.verdict[success ? "win" : "loss"];
  if (authored) return authored;
  if (!signal) {
    return success ? flavor.winNoSignal : flavor.lossNoSignal;
  }
  return fill(success ? flavor.winSignal : flavor.lossSignal, { signal });
}

function simulateRound(product, decision, investmentAmount, balance) {
  const flavor = FLAVOR[getLang()] || FLAVOR.en;

  if (decision === "pass") {
    // Reveal what would have happened — passing shouldn't feel like a void.
    const wouldHaveHit = Math.random() < product.successProb;
    return {
      product_id: product.id,
      decision: "pass",
      investment_amount: 0,
      profit_loss: 0,
      new_balance: balance,
      outcome_multiplier: 1,
      outcome_revealed: flavor.passRevealed,
      success_prob: product.successProb,
      bet_fraction: 0,
      would_have_hit: wouldHaveHit,
      decisive_signal: decisiveSignal(product, wouldHaveHit),
      decisive_type: wouldHaveHit ? "green" : "red",
      verdict_reason: wouldHaveHit
        ? fill(flavor.passWouldHit, { mult: product.returnMultiplier.toFixed(1) })
        : flavor.passGoodCall,
    };
  }

  const success = Math.random() < product.successProb;
  const profitLoss = success
    ? Math.round(investmentAmount * (product.returnMultiplier - 1))
    : -investmentAmount;

  const outcomes = OUTCOMES[getLang()] || OUTCOMES.en;
  const template = success ? pick(outcomes.win) : pick(outcomes.loss);
  const outcomeRevealed = fill(template, {
    name: product.name,
    mult: product.returnMultiplier.toFixed(1),
  });

  const signal = decisiveSignal(product, success);

  return {
    product_id: product.id,
    decision: "invest",
    investment_amount: investmentAmount,
    profit_loss: profitLoss,
    new_balance: balance + profitLoss,
    outcome_multiplier: success ? product.returnMultiplier : 0,
    outcome_revealed: outcomeRevealed,
    success_prob: product.successProb,
    bet_fraction: balance > 0 ? investmentAmount / balance : 0,
    decisive_signal: signal,
    decisive_type: success ? "green" : "red",
    verdict_reason: verdictReason(product, success, signal),
  };
}

// ── Mock leaderboard data ─────────────────────────────────────
// Usernames are handles — left untranslated on purpose.

const MOCK_LEADERBOARD = [
  { username: "SharkMaster", score: 84700, balance: 84700, mode: "classic", created_at: "2026-06-28T10:00:00Z" },
  { username: "VCFOMO", score: 72100, balance: 72100, mode: "classic", created_at: "2026-06-28T09:30:00Z" },
  { username: "BurnRateBarb", score: 68500, balance: 68500, mode: "classic", created_at: "2026-06-28T09:00:00Z" },
  { username: "DilutionDan", score: 55300, balance: 55300, mode: "classic", created_at: "2026-06-28T08:30:00Z" },
  { username: "MoonshotMike", score: 49200, balance: 49200, mode: "classic", created_at: "2026-06-28T08:00:00Z" },
  { username: "PivotQueen", score: 41800, balance: 41800, mode: "classic", created_at: "2026-06-28T07:30:00Z" },
  { username: "TermSheetTim", score: 38400, balance: 38400, mode: "classic", created_at: "2026-06-28T07:00:00Z" },
  { username: "UnicornHunter", score: 35600, balance: 35600, mode: "classic", created_at: "2026-06-28T06:30:00Z" },
  { username: "SeedStageSally", score: 31200, balance: 31200, mode: "classic", created_at: "2026-06-28T06:00:00Z" },
  { username: "BurnNoticeBob", score: 28900, balance: 28900, mode: "classic", created_at: "2026-06-28T05:30:00Z" },
  { username: "GammaRayGloria", score: 26400, balance: 26400, mode: "classic", created_at: "2026-06-28T05:00:00Z" },
  { username: "PreMoneyPete", score: 24100, balance: 24100, mode: "classic", created_at: "2026-06-28T04:30:00Z" },
  { username: "CapTableCarl", score: 21800, balance: 21800, mode: "classic", created_at: "2026-06-28T04:00:00Z" },
  { username: "LiquidationLiz", score: 19500, balance: 19500, mode: "classic", created_at: "2026-06-28T03:30:00Z" },
  { username: "DownRoundDoug", score: 17200, balance: 17200, mode: "classic", created_at: "2026-06-28T03:00:00Z" },
  { username: "ProRataPam", score: 14900, balance: 14900, mode: "classic", created_at: "2026-06-28T02:30:00Z" },
  { username: "VestingVic", score: 12600, balance: 12600, mode: "classic", created_at: "2026-06-28T02:00:00Z" },
  { username: "CliffClaire", score: 10300, balance: 10300, mode: "classic", created_at: "2026-06-28T01:30:00Z" },
  { username: "BootstrapBill", score: 8500, balance: 8500, mode: "classic", created_at: "2026-06-28T01:00:00Z" },
  { username: "RunwayRachel", score: 6200, balance: 6200, mode: "classic", created_at: "2026-06-28T00:30:00Z" },
  { username: "ZerobasedZeke", score: 4100, balance: 4100, mode: "classic", created_at: "2026-06-28T00:00:00Z" },
  { username: "DefaultDiana", score: 2300, balance: 2300, mode: "classic", created_at: "2026-06-27T23:30:00Z" },
  { username: "FlushPhil", score: 800, balance: 800, mode: "classic", created_at: "2026-06-27T23:00:00Z" },
  { username: "BagHolderBrenda", score: 200, balance: 200, mode: "classic", created_at: "2026-06-27T22:30:00Z" },
  { username: "REKTD_Randy", score: 0, balance: 0, mode: "classic", created_at: "2026-06-27T22:00:00Z" },
];

// ── API surface (matches original shape, all local) ───────────

// Internal session state maps (for local mode)
const _sessionProducts = new Map();
const _sessionBalances = new Map();
const _sessionRounds = new Map();

export const gameApi = {
  createSession: async (mode = "classic") => {
    const session = createLocalSession(mode);
    _sessionProducts.set(session.id, session.products);
    _sessionBalances.set(session.id, session.starting_balance);
    _sessionRounds.set(session.id, 0);
    return session;
  },
  playRound: async (sessionId, data) => {
    const products = _sessionProducts.get(sessionId);
    const product = products?.find(p => p.id === data.product_id);
    if (!product) throw new Error("Product not found in session");
    const currentBalance = _sessionBalances.get(sessionId) ?? 10000;
    const result = simulateRound(product, data.decision, data.investment_amount, currentBalance);
    _sessionBalances.set(sessionId, result.new_balance);
    _sessionRounds.set(sessionId, (_sessionRounds.get(sessionId) ?? 0) + 1);
    return result;
  },
  endSession: async (sessionId) => {
    const balance = _sessionBalances.get(sessionId) ?? 10000;
    return {
      session_id: sessionId,
      final_balance: balance,
      profit_loss: balance - 10000,
      rounds_played: _sessionRounds.get(sessionId) ?? 0,
    };
  },
};

export const challengeApi = {
  getDaily: async () => ({
    id: `daily-${new Date().toISOString().slice(0, 10)}`,
    challenge_date: new Date().toISOString(),
    completed: false,
    products: dailyChallengeSet(),
  }),
  startDaily: async () => {
    const session = createLocalSession("daily");
    _sessionProducts.set(session.id, dailyChallengeSet());
    _sessionBalances.set(session.id, session.starting_balance);
    _sessionRounds.set(session.id, 0);
    return { id: `daily-${new Date().toISOString().slice(0, 10)}`, session };
  },
  submitDaily: async (challengeId, decisions) => {
    // Local scoring — count decisions and simulate outcomes
    const set = dailyChallengeSet();
    let correct = 0;
    const total = decisions.length;
    let score = 0;
    for (const d of decisions) {
      const product = set.find(p => p.id === d.product_id);
      if (!product) continue;
      if (d.decision === "invest" && product.successProb > 0.5) correct++;
      if (d.decision === "pass" && product.successProb < 0.5) correct++;
      if (d.decision === "invest") score += Math.round(10000 * (product.successProb > 0.5 ? product.returnMultiplier - 1 : -1));
    }
    return {
      challengeId,
      submitted: true,
      correct_count: correct,
      total_products: total,
      score,
      rank: Math.floor(Math.random() * 50) + 1,
      total_players: 500 + Math.floor(Math.random() * 200),
      xp_earned: 50 + correct * 10,
    };
  },
  dailyLeaderboard: async () => MOCK_LEADERBOARD,
  dailyStreak: async () => ({ streak: 0, last_played: null }),
  createFriendChallenge: async () => ({
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
  }),
  previewFriendChallenge: async () => null,
  acceptFriendChallenge: async () => null,
};

export const leaderboardApi = {
  get: async () => MOCK_LEADERBOARD,
};

export const shopApi = {
  getBoosters: async () => getBoosters(getLang()),
  buyBooster: async (boosterId) => ({ success: true, boosterId }),
};

export const profileApi = {
  getProfile: async () => ({
    username: "GuestShark",
    display_name: "Guest Shark",
    avatar_url: null,
    shark_coins: 500,
    level: 1,
  }),
  getStats: async () => getStatsSnapshot(),
  getAchievements: async () => [],
};

export const socialApi = {
  getReferralCode: async () => ({ code: "SHARK-" + Math.random().toString(36).slice(2, 8).toUpperCase() }),
  claimReferral: async () => ({ success: true }),
};

// ── Auth (demo mode — no real backend) ────────────────────────

export const authApi = {
  register: async (data) => {
    const user = {
      id: "demo-user-" + Date.now(),
      username: data.username,
      email: data.email,
      display_name: data.username,
      avatar_url: null,
    };
    localStorage.setItem("demo_user", JSON.stringify(user));
    return {
      access_token: "demo-token-" + Date.now(),
      refresh_token: "demo-refresh-" + Date.now(),
      user,
    };
  },
  login: async (data) => {
    const username = data.email?.split("@")[0] || "SharkPlayer";
    const user = {
      id: "demo-user-login",
      username,
      email: data.email,
      display_name: username,
      avatar_url: null,
    };
    localStorage.setItem("demo_user", JSON.stringify(user));
    return {
      access_token: "demo-token-" + Date.now(),
      refresh_token: "demo-refresh-" + Date.now(),
      user,
    };
  },
  me: async () => {
    const stored = localStorage.getItem("demo_user");
    if (stored) return JSON.parse(stored);
    throw new Error("No session");
  },
  updateMe: async (data) => {
    const stored = localStorage.getItem("demo_user");
    const user = stored ? JSON.parse(stored) : {};
    const updated = { ...user, ...data };
    localStorage.setItem("demo_user", JSON.stringify(updated));
    return updated;
  },
  logout: async () => ({}),
};

// ── Token management (demo mode) ──────────────────────────────

export function setTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

// ── URL Challenge encode/decode ───────────────────────────────

export function encodeChallenge(products, decisions, score, playerName) {
  const payload = { p: products, d: decisions, s: score, n: playerName || "Anonymous Shark" };
  const json = JSON.stringify(payload);
  return btoa(encodeURIComponent(json));
}

export function decodeChallenge(code) {
  try {
    const json = decodeURIComponent(atob(code));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Exposed to keep the demo/real-backend switch discoverable in one place.
export { API_BASE };
