// Demo-mode API client — works fully client-side with no backend.
// Falls back to mock data for everything.
// When VITE_API_URL is set, it will try the real backend first.

const API_BASE = import.meta.env.VITE_API_URL || "";

// ── Product generation (local, no server) ──────────────────

const CATEGORIES = {
  app: { label: "App", emoji: "📱", color: "#6366f1", subcategories: ["Productivity", "Social", "Gaming", "Fitness", "Finance", "Dating", "Education", "Shopping"] },
  gadget: { label: "Gadget", emoji: "🔧", color: "#06b6d4", subcategories: ["Wearable", "Smart Home", "Accessory", "Health Tech", "Audio"] },
  food: { label: "Food & Drink", emoji: "🍔", color: "#f59e0b", subcategories: ["Snack", "Beverage", "Health Food", "Fast Food", "Supplement"] },
  service: { label: "Service", emoji: "⚡", color: "#10b981", subcategories: ["Subscription", "On-Demand", "B2B SaaS", "Marketplace", "Delivery"] },
  fashion: { label: "Fashion", emoji: "👟", color: "#ec4899", subcategories: ["Streetwear", "Athleisure", "Accessories", "Sustainable", "Luxury"] },
};

const ADJECTIVES = ["Ultra", "Hyper", "Super", "Nano", "Mega", "Smart", "AI", "Turbo", "Zen", "Flux", "Neo", "Vibe", "Peak", "Core", "Pure", "Swift", "Bold", "Nova"];
const NOUNS_APP = ["Pulse", "Flow", "Snap", "Sync", "Boost", "Track", "Link", "Hub", "Nest", "Glow", "Stack", "Loop", "Dash", "Vault", "Spark"];
const NOUNS_GADGET = ["Band", "Clip", "Ring", "Dot", "Cube", "Pad", "Lens", "Pod", "Tag", "Beam", "Bolt", "Node", "Chip"];
const NOUNS_FOOD = ["Bar", "Drops", "Bites", "Brew", "Blend", "Shot", "Crunch", "Sip", "Munch", "Fuel"];
const NOUNS_SERVICE = ["Pass", "Pro", "Plus", "Club", "Circle", "Network", "Crew", "Suite", "Hub", "Base"];
const NOUNS_FASHION = ["Kicks", "Fit", "Drop", "Layer", "Edge", "Cut", "Thread", "Weave", "Form"];

const NOUN_MAP = { app: NOUNS_APP, gadget: NOUNS_GADGET, food: NOUNS_FOOD, service: NOUNS_SERVICE, fashion: NOUNS_FASHION };

const TAGLINES = {
  app: ["The app your phone has been waiting for.", "Everything you need, in one tap.", "Work smarter. Live better.", "Your life, optimized.", "Connect. Create. Conquer.", "Stop wasting time. Start achieving.", "Built for the go-getters."],
  gadget: ["Small device. Big impact.", "Wear the future.", "Technology that fits your life.", "Engineered for performance.", "The gadget you never knew you needed.", "Level up your everyday.", "Built different."],
  food: ["Fuel your hustle.", "Taste the difference.", "Because you deserve better.", "Clean ingredients. Dirty gains.", "Your new daily ritual.", "Nature-powered. Science-backed.", "Snack smarter."],
  service: ["Everything you need, delivered.", "Cancel anytime. (You won't want to.)", "Join 10,000+ happy members.", "The subscription that pays for itself.", "Your unfair advantage.", "Professional tools. Startup price."],
  fashion: ["Wear what you believe in.", "Limited drop. Forever style.", "Made for the ones who move.", "Quality over hype.", "Built to last. Made to stand out.", "The uniform of the bold."],
};

const GREEN_FLAGS = ["Backed by a former Google engineer", "TikTok trend already forming", "Solves a real daily problem", "First mover in the category", "Strong early App Store reviews", "Featured on Product Hunt #1", "Celebrity quietly using it", "Viral waitlist — 50k signups", "Repeat purchase rate > 60%", "Profitable from day 30", "Organic word-of-mouth spreading", "Gen Z is obsessed", "Low CAC, high retention", "Patent pending technology", "Partnership with major retailer confirmed"];
const RED_FLAGS = ["Founder deleted their LinkedIn", "App crashes on iPhone 14+", "Already 12 competitors doing the same", "Zero traction after 6 months", "Negative press from major outlet", "Refund rate above 40%", "Influencer deals fell through", "Only works on Android 10+", "CEO has a controversial past", "Targeting everyone = targeting no one", "Margin barely covers shipping", "Late to a dying trend", "No clear monetization model", "Founder ghosting investors", "Product doesn't work as advertised"];

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
  const categoryKey = pick(Object.keys(CATEGORIES));
  const category = CATEGORIES[categoryKey];
  const nouns = NOUN_MAP[categoryKey];
  const name = `${pick(ADJECTIVES)}${pick(nouns)}`;
  const tagline = pick(TAGLINES[categoryKey]);
  const subcategory = pick(category.subcategories);
  const targetMarket = pick(TARGET_MARKETS);
  const price = pick(PRICE_RANGES[categoryKey]);
  const hypeScore = Math.floor(Math.random() * 10) + 1;
  const totalSignals = 2 + Math.floor(Math.random() * 3);
  const greenCount = hypeScore >= 7 ? Math.ceil(totalSignals * 0.75) : hypeScore >= 4 ? Math.ceil(totalSignals * 0.5) : Math.floor(totalSignals * 0.25);
  const redCount = totalSignals - greenCount;
  const signals = [
    ...pickN(GREEN_FLAGS, greenCount).map(s => ({ text: s, type: "green" })),
    ...pickN(RED_FLAGS, redCount).map(s => ({ text: s, type: "red" })),
  ].sort(() => Math.random() - 0.5);
  const successProb = hypeScore >= 7 ? 0.70 + (hypeScore - 7) * 0.05 : hypeScore >= 4 ? 0.35 + (hypeScore - 4) * 0.05 : 0.10 + (hypeScore - 1) * 0.05;
  const returnMultiplier = 1.2 + (hypeScore / 10) * 4;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name, tagline, categoryKey, categoryLabel: category.label, categoryEmoji: category.emoji,
    categoryColor: category.color, subcategory, targetMarket, price, signals,
    hypeScore, successProb, returnMultiplier,
    // ProductCard compatibility
    description: tagline,
    category: category.label,
    rarity: hypeScore >= 8 ? "legendary" : hypeScore >= 6 ? "rare" : hypeScore >= 4 ? "uncommon" : "common",
    difficulty: Math.min(5, Math.ceil(hypeScore / 2)),
    market_signals: signals.map(s => s.text),
  };
}

// ── Curated meme products (genuinely funny, screenshot-worthy) ──────

const ABSURD_PRODUCTS = [
  {
    id: "meme-1",
    name: "Juicero 2.0",
    tagline: "This time the juice is digital. NFT-compatible.",
    description: "A $400 WiFi-connected juicer that requires a subscription to squeeze packets. Again. But this time the packets are NFTs.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🧃", categoryColor: "#f59e0b",
    rarity: "legendary", difficulty: 3,
    market_signals: ["went viral on TikTok with 2M+ views", "founders are former Juicero engineers (unironically)", "Kevin Hart invested (he doesn't know what it does either)"],
    hypeScore: 7, successProb: 0.65, returnMultiplier: 3.5,
  },
  {
    id: "meme-2",
    name: "GhostPass",
    tagline: "The subscription that ghosts people for you. Professionally.",
    description: "Tired of awkward conversations? GhostPass auto-reads and ignores messages from your ex, your boss, and that guy from college who wants to 'pick your brain'.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "👻", categoryColor: "#10b981",
    rarity: "rare", difficulty: 2,
    market_signals: ["1M signups in the first week", "founder is a former Tinder PM with 3 exits", "literally no monetization beyond $9/mo"],
    hypeScore: 8, successProb: 0.70, returnMultiplier: 2.8,
  },
  {
    id: "meme-3",
    name: "PawlyAI",
    tagline: "AI that translates your dog's barks into stock picks.",
    description: "Your golden retriever barks at the mailman? That's a buy signal for UPS. PawlyAI uses 'proprietary neural networks' (a random number generator) to turn bark patterns into investment advice.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🐶", categoryColor: "#6366f1",
    rarity: "rare", difficulty: 2,
    market_signals: ["App Store #1 in a category they invented", "50 dog influencers already booked", "SEC is 'looking into it'"],
    hypeScore: 6, successProb: 0.45, returnMultiplier: 2.5,
  },
  {
    id: "meme-4",
    name: "SweatSell",
    tagline: "We bottle your gym sweat and sell it as 'pre-workout'.",
    description: "Why let your sweat go to waste? SweatSell bottles your post-workout perspiration and sells it to supplement companies. You get 2% revenue share. In sweatcoins.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "💧", categoryColor: "#10b981",
    rarity: "uncommon", difficulty: 3,
    market_signals: ["partnered with a cosmetics company that needs human sweat for testing", "surprisingly high retention — people love getting paid", "regulatory nightmare in 14 states"],
    hypeScore: 7, successProb: 0.55, returnMultiplier: 3.0,
  },
  {
    id: "meme-5",
    name: "CloudLoaf",
    tagline: "Bread that exists only in the blockchain. You can't eat it.",
    description: "The world's first NFT bread. Each loaf is uniquely generated and stored on-chain. You can't eat it, toast it, or smell it. But you CAN trade it. Current floor price: 0.003 ETH.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🍞", categoryColor: "#f59e0b",
    rarity: "uncommon", difficulty: 4,
    market_signals: ["pivoted from a failed NFT marketplace", "actually profitable — $0.99 minting fee adds up", "nobody can explain what cloud bread is"],
    hypeScore: 3, successProb: 0.15, returnMultiplier: 1.5,
  },
  {
    id: "meme-6",
    name: "MoodMug",
    tagline: "A coffee mug that posts your mood to LinkedIn.",
    description: "Smart mug with biometric sensors that detects your stress level and auto-posts to LinkedIn: 'Feeling challenged but growing! 💪 #hustle'. Your network will never know you're crying.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "☕", categoryColor: "#f59e0b",
    rarity: "uncommon", difficulty: 2,
    market_signals: ["TikTok trend where people screenshot the awkward posts", "LinkedIn integration is technically against ToS", "pre-orders sold out in 4 hours"],
    hypeScore: 5, successProb: 0.35, returnMultiplier: 2.2,
  },
  {
    id: "meme-7",
    name: "ShamePlug",
    tagline: "A smart plug that turns off your devices when you procrastinate.",
    description: "ShamePlug monitors your screen activity. Open Reddit? Your monitor turns off. Check Instagram? Your phone charger disconnects. It texts your mom every time you slack off.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🔌", categoryColor: "#06b6d4",
    rarity: "rare", difficulty: 1,
    market_signals: ["72% of users throw it away within a week", "but the 28% who keep it report 40% productivity gains", "viral unboxing videos of people destroying them"],
    hypeScore: 6, successProb: 0.50, returnMultiplier: 2.4,
  },
  {
    id: "meme-8",
    name: "VibeCheck",
    tagline: "An app that rates your vibe on a scale of 1-10 using your selfies.",
    description: "Upload a selfie. Our AI (a Magic 8-Ball) rates your vibe. If you score below 4, the app suggests you 'touch grass'. Premium tier ($19.99/mo) gives you a 10/10 every time.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "📸", categoryColor: "#6366f1",
    rarity: "common", difficulty: 1,
    market_signals: ["Gen Z adoption is insane — 200k DAU in month one", "premium tier ($19.99) is 40% of revenue", "founder is 19 and dropped out of high school"],
    hypeScore: 8, successProb: 0.75, returnMultiplier: 3.2,
  },
  {
    id: "meme-9",
    name: "ExBox",
    tagline: "A subscription box that sends you something your ex would hate.",
    description: "Every month, ExBox delivers items curated to annoy your ex: a couples' cooking class voucher, a 'World's Best Girlfriend' mug, a gym membership brochure. petty? Yes. Profitable? Also yes.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "📦", categoryColor: "#ec4899",
    rarity: "uncommon", difficulty: 2,
    market_signals: [" TikTok reviews averaging 500k views each", "gross margin is 70% — the items are dirt cheap", "founder was on a reality TV show"],
    hypeScore: 6, successProb: 0.55, returnMultiplier: 2.6,
  },
  {
    id: "meme-10",
    name: "BrainRot",
    tagline: "An app that pays you to scroll TikTok. (In brainrot tokens.)",
    description: "Watch TikToks for 4 hours? You earn 47 BrainRot tokens. 1,000 BrainRot tokens = $1 (non-transferable, non-refundable, does not exist). But the streaks feel real.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🧠", categoryColor: "#6366f1",
    rarity: "legendary", difficulty: 2,
    market_signals: ["3M downloads in first month", "the token has no real value but users don't care", "average session length: 3.7 hours"],
    hypeScore: 9, successProb: 0.80, returnMultiplier: 4.0,
  },
  {
    id: "meme-11",
    name: "CricketFarm",
    tagline: "Urban cricket farming kits. For protein. Yes, really.",
    description: "Grow your own crickets at home! Each kit includes 500 crickets, a terrarium, and a recipe book. Because nothing says 'I'm an environmentalist' like eating bugs in your studio apartment.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🦗", categoryColor: "#10b981",
    rarity: "common", difficulty: 3,
    market_signals: ["UN report says insects are the future of protein", "Average user gets attached to crickets and can't eat them", "PETA gave it a 'cruelty-free' rating (the crickets disagree)"],
    hypeScore: 4, successProb: 0.25, returnMultiplier: 1.8,
  },
  {
    id: "meme-12",
    name: "WiFiWater",
    tagline: "Water but it has WiFi. Don't ask questions.",
    description: "Smart water bottles with embedded WiFi hotspots. The water is regular water. The WiFi is regular WiFi. But the bottle costs $89 and the subscription is $15/mo. VCs love it.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "📶", categoryColor: "#06b6d4",
    rarity: "rare", difficulty: 2,
    market_signals: ["Sequoia led the seed round (they won't confirm)", "$5M in pre-orders from tech bros", "The WiFi doesn't actually work underwater"],
    hypeScore: 5, successProb: 0.30, returnMultiplier: 2.0,
  },
  {
    id: "meme-13",
    name: "TherapizeMe",
    tagline: "Uber for therapy. But the therapists are AI. And the AI is a chatbot. And the chatbot is just Eliza from 1966.",
    description: "Why pay $200/hr for a real therapist when you can pay $49/mo for a 1960s chatbot that says 'How does that make you feel?' on loop? Now with NFT mood rings.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🛋️", categoryColor: "#a855f7",
    rarity: "uncommon", difficulty: 2,
    market_signals: ["600% increase in users since the CEO's viral TED talk", "lawsuit from the APA pending", "users report it 'actually kind of helps' (placebo effect)"],
    hypeScore: 7, successProb: 0.60, returnMultiplier: 2.7,
  },
  {
    id: "meme-14",
    name: "GymCoin",
    tagline: "A crypto you can only mine by doing bicep curls.",
    description: "GymCoin mining rig is a dumbbell with an accelerometer. Do a curl? Mine a coin. The coin has no market value but your arms look great. Powered by Proof of Gains.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "💪", categoryColor: "#10b981",
    rarity: "legendary", difficulty: 2,
    market_signals: ["gym influencers are ALL IN — 200+ posts last week", "the blockchain is just a Google Sheet", "but 50k people are mining and getting jacked"],
    hypeScore: 8, successProb: 0.70, returnMultiplier: 3.8,
  },
  {
    id: "meme-15",
    name: "SnoozeFest",
    tagline: "A social network where you only post when you're asleep.",
    description: "SnoozeFest uses your phone's accelerometer to detect sleep-talking, sleep-texting, and sleep-scrolling. Your unconscious posts go public. Your friends rate your dream content.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "😴", categoryColor: "#6366f1",
    rarity: "common", difficulty: 1,
    market_signals: ["viral after someone proposed in their sleep", "average user posts 3.2 things per night", "nobody remembers what they posted"],
    hypeScore: 6, successProb: 0.50, returnMultiplier: 2.3,
  },
  {
    id: "meme-16",
    name: "CouponDAO",
    tagline: "A decentralized autonomous organization for clipping coupons.",
    description: "Why clip coupons alone when you can do it on the blockchain? CouponDAO lets users collectively negotiate discounts at Subway. Gas fees: $14. Savings: $2.50.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🎫", categoryColor: "#a855f7",
    rarity: "uncommon", difficulty: 4,
    market_signals: ["Web3 community is hyped (they don't know what coupons are)", "raised $12M in a token sale", "the only real partnership is with a single Subway franchise"],
    hypeScore: 3, successProb: 0.10, returnMultiplier: 1.3,
  },
  {
    id: "meme-17",
    name: "Platonic",
    tagline: "Tinder but you swipe right to make friends. Nobody swipes right.",
    description: "Making friends as an adult is hard. Platonic makes it harder by adding dating-app anxiety to platonic relationships. Swipe right to be friends! (They never swipe back.)",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🤝", categoryColor: "#ec4899",
    rarity: "common", difficulty: 2,
    market_signals: ["500k downloads but 0.3% match rate", "users report feeling MORE lonely", "but the UX is beautiful and investors love the pitch deck"],
    hypeScore: 4, successProb: 0.20, returnMultiplier: 1.6,
  },
  {
    id: "meme-18",
    name: "CaffeinePatch",
    tagline: "A nicotine patch but it's caffeine. Stick it on, never sleep again.",
    description: "Slow-release caffeine delivered transdermally. One patch = 12 cups of coffee. Side effects include: trembling, productivity, and a vague sense that you can see through time.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "⚡", categoryColor: "#f59e0b",
    rarity: "rare", difficulty: 2,
    market_signals: ["Silicon Valley VCs are literally addicted", "$3M in pre-orders from Y Combinator batch", "FDA approval is 'pending' (they keep rejecting it)"],
    hypeScore: 7, successProb: 0.55, returnMultiplier: 3.0,
  },
  {
    id: "meme-19",
    name: "RentAFriend",
    tagline: "Airbnb but you rent a friend's friend for social events.",
    description: "Need a plus-one for a wedding? A wingman for a bar? Someone to stand next to you in photos so you don't look alone? RentAFriend connects you with someone else's friend for $25/hr.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🎭", categoryColor: "#ec4899",
    rarity: "uncommon", difficulty: 2,
    market_signals: ["massive demand during wedding season", "60% of renters become repeat customers", "the 'friends' are mostly aspiring actors"],
    hypeScore: 6, successProb: 0.55, returnMultiplier: 2.5,
  },
  {
    id: "meme-20",
    name: "CancelBot",
    tagline: "An AI that cancels your subscriptions before you forget. Also cancels plans.",
    description: "CancelBot auto-cancels free trials before they charge you. But it also cancels your dinner plans, your dentist appointments, and your gym membership. It just really likes canceling things.",
    categoryLabel: "Absurd/Meme", categoryEmoji: "🤖", categoryColor: "#6366f1",
    rarity: "rare", difficulty: 1,
    market_signals: ["saves users $340/year on average", "but also cancels important things 12% of the time", "users are 'frustrated but addicted'"],
    hypeScore: 7, successProb: 0.65, returnMultiplier: 2.9,
  },
];

// ── Session simulation (local, no server) ─────────────────────

function createLocalSession(mode = "classic") {
  const products = [];
  for (let i = 0; i < 5; i++) {
    // 80% chance to use a meme product, 20% random
    if (Math.random() < 0.8 && ABSURD_PRODUCTS.length > 0) {
      const meme = ABSURD_PRODUCTS[Math.floor(Math.random() * ABSURD_PRODUCTS.length)];
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

function simulateRound(product, decision, investmentAmount, balance) {
  if (decision === "pass") {
    return {
      product_id: product.id,
      decision: "pass",
      investment_amount: 0,
      profit_loss: 0,
      new_balance: balance,
      outcome_multiplier: 1,
      outcome_revealed: "You passed. Safe play. (Boring.)",
    };
  }

  const success = Math.random() < product.successProb;
  const profitLoss = success
    ? Math.round(investmentAmount * (product.returnMultiplier - 1))
    : -investmentAmount;

  const outcomes = success
    ? [
        `🚀 ${product.name} went VIRAL on TikTok! ${product.returnMultiplier.toFixed(1)}x return!`,
        `📈 ${product.name} got acquired by Meta for some reason! Huge payday!`,
        `🔥 ${product.name} hit #1 on Product Hunt! Investors are FOMOing in!`,
        `💰 ${product.name} raised a Series B at a $500M valuation! You're a genius!`,
        `👑 ${product.name} is now a household name. Literally. It's in people's houses.`,
        `🤑 ${product.name} IPO'd. You're on a yacht now. The yacht has WiFi.`,
        `⭐ ${product.name} got a shoutout from Elon on X. Stock mooned. You mooned.`,
        `🎯 ${product.name} pivoted to AI and 10x'd revenue overnight! Classic.`,
      ]
    : [
        `💥 ${product.name} flopped. The market wasn't ready (or ever will be).`,
        `📉 ${product.name} ran out of runway. Founder pivoted to an AI dog translator.`,
        `💀 ${product.name} got roasted on Twitter for 48 hours straight. Refund requests flooding in.`,
        `🪦 ${product.name} shut down. The CEO posted a LinkedIn apology. It has 3 likes.`,
        `🔥 ${product.name} literally caught fire. Product liability lawsuit incoming.`,
        `📉 ${product.name} was a scam. The founder is in Bali. You're not.`,
        `💸 ${product.name} burned through $50M in 8 months. All spent on branded swag.`,
        `😭 ${product.name} got disrupted by a 19-year-old's side project. Embarrassing.`,
      ];

  return {
    product_id: product.id,
    decision: "invest",
    investment_amount: investmentAmount,
    profit_loss: profitLoss,
    new_balance: balance + profitLoss,
    outcome_multiplier: success ? product.returnMultiplier : 0,
    outcome_revealed: pick(outcomes),
  };
}

// ── Mock leaderboard data ─────────────────────────────────────

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

// ── Mock daily challenge product set (resets weekly) ──────────

const DAILY_CHALLENGE_SET = [
  ABSURD_PRODUCTS[0],  // Juicero 2.0
  ABSURD_PRODUCTS[7],  // VibeCheck
  ABSURD_PRODUCTS[9],  // BrainRot
  ABSURD_PRODUCTS[13], // GymCoin
  ABSURD_PRODUCTS[19], // CancelBot
].map((p, i) => ({ ...p, id: `daily-${i}` }));

// ── API surface (matches original shape, all local) ───────────

export const gameApi = {
  createSession: async (mode = "classic") => {
    return createLocalSession(mode);
  },
  playRound: async (sessionId, data) => {
    // Find the product from the gameStore's products array
    // We need to look it up from the session — but since we're local,
    // we simulate based on the product data passed in.
    // The gameStore will pass us the product via a closure or we re-derive.
    // For now, we'll store session products in a local map.
    const products = _sessionProducts.get(sessionId);
    const product = products?.find(p => p.id === data.product_id);
    if (!product) throw new Error("Product not found in session");
    return simulateRound(product, data.decision, data.investment_amount, _sessionBalances.get(sessionId) ?? 10000);
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

// Internal session state maps (for local mode)
const _sessionProducts = new Map();
const _sessionBalances = new Map();
const _sessionRounds = new Map();

// Override createSession to also store products
gameApi.createSession = async (mode = "classic") => {
  const session = createLocalSession(mode);
  _sessionProducts.set(session.id, session.products);
  _sessionBalances.set(session.id, session.starting_balance);
  _sessionRounds.set(session.id, 0);
  return session;
};

// Override playRound to update balance
gameApi.playRound = async (sessionId, data) => {
  const products = _sessionProducts.get(sessionId);
  const product = products?.find(p => p.id === data.product_id);
  if (!product) throw new Error("Product not found in session");
  const currentBalance = _sessionBalances.get(sessionId) ?? 10000;
  const result = simulateRound(product, data.decision, data.investment_amount, currentBalance);
  _sessionBalances.set(sessionId, result.new_balance);
  _sessionRounds.set(sessionId, (_sessionRounds.get(sessionId) ?? 0) + 1);
  return result;
};

// Override endSession
gameApi.endSession = async (sessionId) => {
  const balance = _sessionBalances.get(sessionId) ?? 10000;
  return {
    session_id: sessionId,
    final_balance: balance,
    profit_loss: balance - 10000,
    rounds_played: _sessionRounds.get(sessionId) ?? 0,
  };
};

export const challengeApi = {
  getDaily: async () => ({
    id: `daily-${new Date().toISOString().slice(0, 10)}`,
    challenge_date: new Date().toISOString(),
    completed: false,
    products: DAILY_CHALLENGE_SET,
  }),
  startDaily: async () => {
    const session = createLocalSession("daily");
    _sessionProducts.set(session.id, DAILY_CHALLENGE_SET);
    _sessionBalances.set(session.id, session.starting_balance);
    _sessionRounds.set(session.id, 0);
    return { id: `daily-${new Date().toISOString().slice(0, 10)}`, session };
  },
  submitDaily: async (challengeId, decisions) => {
    // Local scoring — count decisions and simulate outcomes
    let correct = 0;
    const total = decisions.length;
    let score = 0;
    for (const d of decisions) {
      const product = DAILY_CHALLENGE_SET.find(p => p.id === d.product_id);
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
  dailyLeaderboard: async (date) => MOCK_LEADERBOARD,
  dailyStreak: async () => ({ streak: 0, last_played: null }),
  createFriendChallenge: async () => ({
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
  }),
  previewFriendChallenge: async () => null,
  acceptFriendChallenge: async () => null,
};

export const leaderboardApi = {
  get: async (type = "all_time", key) => MOCK_LEADERBOARD,
};

export const shopApi = {
  getBoosters: async () => [
    { id: "reroll", name: "Reroll", description: "Get a new product instead of the current one", cost_shark_coins: 50, icon: "🎲", rarity: "common", owned_quantity: 0, usable_in_daily: true },
    { id: "hint", name: "Insider Hint", description: "Reveal the hidden hype score", cost_shark_coins: 100, icon: "🔍", rarity: "uncommon", owned_quantity: 0, usable_in_daily: true },
    { id: "insurance", name: "Insurance", description: "Get 50% of your investment back if you lose", cost_shark_coins: 150, icon: "🛡️", rarity: "rare", owned_quantity: 0, usable_in_daily: true },
    { id: "double_down", name: "Double Down", description: "Double your potential return (and loss)", cost_shark_coins: 200, icon: "⚡", rarity: "rare", owned_quantity: 0, usable_in_daily: false },
    { id: "streak_shield", name: "Streak Shield", description: "Protect your daily streak for one day", cost_shark_coins: 75, icon: "🛡️", rarity: "uncommon", owned_quantity: 0, usable_in_daily: true },
  ],
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
  getStats: async () => ({
    investor_score: 0,
    accuracy: 0,
    total_profit: 0,
    total_rounds: 0,
    biggest_win: 0,
    current_streak: 0,
    best_streak: 0,
    level: 1,
    xp: 0,
    persona: "Minnow",
    risk_profile: "Unknown",
  }),
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
