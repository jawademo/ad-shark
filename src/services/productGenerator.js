// ============================================================
// Product Generator — Strategy Pattern
// Swap `strategy` for 'llm' when ready to plug in OpenAI/etc.
// ============================================================

const CATEGORIES = {
  app: {
    label: 'App',
    emoji: '📱',
    color: '#6366f1',
    subcategories: ['Productivity', 'Social', 'Gaming', 'Fitness', 'Finance', 'Dating', 'Education', 'Shopping'],
  },
  gadget: {
    label: 'Gadget',
    emoji: '🔧',
    color: '#06b6d4',
    subcategories: ['Wearable', 'Smart Home', 'Accessory', 'Health Tech', 'Audio'],
  },
  food: {
    label: 'Food & Drink',
    emoji: '🍔',
    color: '#f59e0b',
    subcategories: ['Snack', 'Beverage', 'Health Food', 'Fast Food', 'Supplement'],
  },
  service: {
    label: 'Service',
    emoji: '⚡',
    color: '#10b981',
    subcategories: ['Subscription', 'On-Demand', 'B2B SaaS', 'Marketplace', 'Delivery'],
  },
  fashion: {
    label: 'Fashion',
    emoji: '👟',
    color: '#ec4899',
    subcategories: ['Streetwear', 'Athleisure', 'Accessories', 'Sustainable', 'Luxury'],
  },
}

const ADJECTIVES = ['Ultra', 'Hyper', 'Super', 'Nano', 'Mega', 'Smart', 'AI', 'Turbo', 'Zen', 'Flux', 'Neo', 'Vibe', 'Peak', 'Core', 'Pure', 'Swift', 'Bold', 'Nova']
const NOUNS_APP = ['Pulse', 'Flow', 'Snap', 'Sync', 'Boost', 'Track', 'Link', 'Hub', 'Nest', 'Glow', 'Stack', 'Loop', 'Dash', 'Vault', 'Spark']
const NOUNS_GADGET = ['Band', 'Clip', 'Ring', 'Dot', 'Cube', 'Pad', 'Lens', 'Pod', 'Tag', 'Beam', 'Bolt', 'Node', 'Chip']
const NOUNS_FOOD = ['Bar', 'Drops', 'Bites', 'Brew', 'Blend', 'Shot', 'Crunch', 'Sip', 'Munch', 'Fuel']
const NOUNS_SERVICE = ['Pass', 'Pro', 'Plus', 'Club', 'Circle', 'Network', 'Crew', 'Suite', 'Hub', 'Base']
const NOUNS_FASHION = ['Kicks', 'Fit', 'Drop', 'Layer', 'Edge', 'Cut', 'Thread', 'Weave', 'Form']

const NOUN_MAP = {
  app: NOUNS_APP,
  gadget: NOUNS_GADGET,
  food: NOUNS_FOOD,
  service: NOUNS_SERVICE,
  fashion: NOUNS_FASHION,
}

const TAGLINES = {
  app: [
    'The app your phone has been waiting for.',
    'Everything you need, in one tap.',
    'Work smarter. Live better.',
    'Your life, optimized.',
    'Connect. Create. Conquer.',
    'The future of [X] is here.',
    'Stop wasting time. Start achieving.',
    'Built for the go-getters.',
  ],
  gadget: [
    'Small device. Big impact.',
    'Wear the future.',
    'Technology that fits your life.',
    'Engineered for performance.',
    'The gadget you never knew you needed.',
    'Level up your everyday.',
    'Built different.',
  ],
  food: [
    'Fuel your hustle.',
    'Taste the difference.',
    'Because you deserve better.',
    'Clean ingredients. Dirty gains.',
    'Your new daily ritual.',
    'Nature-powered. Science-backed.',
    'Snack smarter.',
  ],
  service: [
    'Everything you need, delivered.',
    'Cancel anytime. (You won\'t want to.)',
    'Join 10,000+ happy members.',
    'The subscription that pays for itself.',
    'Your unfair advantage.',
    'Professional tools. Startup price.',
  ],
  fashion: [
    'Wear what you believe in.',
    'Limited drop. Forever style.',
    'Made for the ones who move.',
    'Quality over hype.',
    'Built to last. Made to stand out.',
    'The uniform of the bold.',
  ],
}

const GREEN_FLAGS = [
  'Backed by a former Google engineer',
  'TikTok trend already forming',
  'Solves a real daily problem',
  'First mover in the category',
  'Strong early App Store reviews',
  'Featured on Product Hunt #1',
  'Celebrity quietly using it',
  'Viral waitlist — 50k signups',
  'Repeat purchase rate > 60%',
  'Profitable from day 30',
  'Organic word-of-mouth spreading',
  'Gen Z is obsessed',
  'Low CAC, high retention',
  'Patent pending technology',
  'Partnership with major retailer confirmed',
]

const RED_FLAGS = [
  'Founder deleted their LinkedIn',
  'App crashes on iPhone 14+',
  'Already 12 competitors doing the same',
  'Zero traction after 6 months',
  'Negative press from major outlet',
  'Refund rate above 40%',
  'Influencer deals fell through',
  'Only works on Android 10+',
  'CEO has a controversial past',
  'Targeting everyone = targeting no one',
  'Margin barely covers shipping',
  'Late to a dying trend',
  'No clear monetization model',
  'Founder ghosting investors',
  'Product doesn\'t work as advertised',
]

const TARGET_MARKETS = [
  'Gen Z (18-24)', 'Millennials (25-35)', 'Busy parents',
  'Remote workers', 'Gym enthusiasts', 'College students',
  'Small business owners', 'Gamers', 'Health-conscious adults',
  'Tech early adopters', 'Freelancers', 'Pet owners',
]

const PRICE_RANGES = {
  app: ['Free (ads)', '$2.99/mo', '$9.99/mo', '$0.99 one-time', '$19.99/yr'],
  gadget: ['$29', '$49', '$79', '$129', '$249', '$399'],
  food: ['$2.99', '$4.99', '$8.99', '$24.99 (12-pack)', '$39.99 (subscription)'],
  service: ['$9/mo', '$19/mo', '$49/mo', '$99/mo', '$299/yr'],
  fashion: ['$29', '$59', '$89', '$149', '$249'],
}

// ---- Helpers ----
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

// ---- Random Generator ----
function generateRandom() {
  const categoryKey = pick(Object.keys(CATEGORIES))
  const category = CATEGORIES[categoryKey]
  const nouns = NOUN_MAP[categoryKey]

  const name = `${pick(ADJECTIVES)}${pick(nouns)}`
  const tagline = pick(TAGLINES[categoryKey])
  const subcategory = pick(category.subcategories)
  const targetMarket = pick(TARGET_MARKETS)
  const price = pick(PRICE_RANGES[categoryKey])

  // Hype score 1-10 (hidden — determines outcome)
  const hypeScore = Math.floor(Math.random() * 10) + 1

  // Number of signals: 2-4 total, mix of green/red based on hype
  const totalSignals = 2 + Math.floor(Math.random() * 3)
  const greenCount = hypeScore >= 7
    ? Math.ceil(totalSignals * 0.75)
    : hypeScore >= 4
      ? Math.ceil(totalSignals * 0.5)
      : Math.floor(totalSignals * 0.25)
  const redCount = totalSignals - greenCount

  const signals = [
    ...pickN(GREEN_FLAGS, greenCount).map(s => ({ text: s, type: 'green' })),
    ...pickN(RED_FLAGS, redCount).map(s => ({ text: s, type: 'red' })),
  ].sort(() => Math.random() - 0.5) // shuffle so green/red aren't grouped

  // Success probability: hype 7-10 = likely win, 4-6 = coin flip, 1-3 = likely fail
  const successProb = hypeScore >= 7 ? 0.70 + (hypeScore - 7) * 0.05
    : hypeScore >= 4 ? 0.35 + (hypeScore - 4) * 0.05
    : 0.10 + (hypeScore - 1) * 0.05

  // Return multiplier on success (higher hype = bigger return)
  const returnMultiplier = 1.2 + (hypeScore / 10) * 4  // 1.2x – 5.2x

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    tagline,
    categoryKey,
    categoryLabel: category.label,
    categoryEmoji: category.emoji,
    categoryColor: category.color,
    subcategory,
    targetMarket,
    price,
    signals,
    hypeScore,       // hidden from UI
    successProb,     // hidden from UI
    returnMultiplier,// hidden from UI
  }
}

// ---- LLM Generator (stub — plug in OpenAI/Anthropic/Ollama here) ----
async function generateWithLLM(options = {}) {
  // TODO: implement when ready
  // const { apiKey, model = 'gpt-4o-mini', baseUrl } = options
  // const prompt = `Generate a fake startup product as JSON with fields:
  //   name, tagline, categoryKey (app|gadget|food|service|fashion),
  //   subcategory, targetMarket, price, signals (array of {text, type: green|red}),
  //   hypeScore (1-10), successProb (0-1), returnMultiplier (float)`
  // const res = await fetch(...)
  // return await res.json()
  console.warn('LLM generator not yet configured — falling back to random')
  return generateRandom()
}

// ---- Public API ----
const GENERATORS = {
  random: generateRandom,
  llm: generateWithLLM,
}

export function generateProduct(strategy = 'random', options = {}) {
  return GENERATORS[strategy](options)
}

export { CATEGORIES }
