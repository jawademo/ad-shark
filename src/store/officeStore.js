import { create } from "zustand";

// ── Office tiers (visual progression) ─────────────────────────
const OFFICE_TIERS = [
  {
    id: 0,
    name: "Coffee Shop Squatter",
    emoji: "☕",
    description: "You're pitching from a Starbucks. The Wi-Fi keeps dropping. Someone is doing a podcast call next to you.",
    cost: 0,
    bgGradient: "from-amber-900/40 to-amber-950/60",
    accentColor: "#f59e0b",
  },
  {
    id: 1,
    name: "Coworking Desk",
    emoji: "🪑",
    description: "A hot desk at WeWork. Free coffee, sketchy Wi-Fi, and someone always reheating fish in the microwave.",
    cost: 5000,
    bgGradient: "from-slate-800/60 to-slate-900/80",
    accentColor: "#64748b",
  },
  {
    id: 2,
    name: "Private Office",
    emoji: "🚪",
    description: "A real office with a door that closes. You can finally take calls without apologizing for background noise.",
    cost: 25000,
    bgGradient: "from-blue-900/40 to-slate-900/80",
    accentColor: "#3b82f6",
  },
  {
    id: 3,
    name: "Corner Office",
    emoji: "🏙️",
    description: "Floor-to-ceiling windows. A view of the city. A mahogany desk. You've made it (almost).",
    cost: 100000,
    bgGradient: "from-indigo-900/50 to-slate-900/80",
    accentColor: "#6366f1",
  },
  {
    id: 4,
    name: "Penthouse Suite",
    emoji: "🏛️",
    description: "Top floor. Private elevator. A secretary named Margaret who screens your calls. You're basically Patrick Bateman (minus the... you know).",
    cost: 500000,
    bgGradient: "from-purple-900/50 to-slate-900/80",
    accentColor: "#a855f7",
  },
  {
    id: 5,
    name: "Private Island HQ",
    emoji: "🏝️",
    description: "You bought an island. Your office is the entire island. VCs fly in by helicopter. There's a shark tank in the lobby (literal sharks).",
    cost: 5000000,
    bgGradient: "from-emerald-900/50 to-slate-900/80",
    accentColor: "#10b981",
  },
];

// ── Office items (cosmetic + flex) ────────────────────────────
const OFFICE_ITEMS = [
  // Tier 0 items (Coffee Shop)
  { id: "laptop_sticker", name: "Startup Sticker Pack", emoji: "📛", cost: 100, tier: 0, description: "Slap 'em on your laptop. Now you look like a founder." },
  { id: "noise_cancelling", name: "Noise-Cancelling Headphones", emoji: "🎧", cost: 500, tier: 0, description: "Block out the podcast bro next to you." },
  { id: "cold_brew", name: "Bottomless Cold Brew", emoji: "🧊", cost: 200, tier: 0, description: "Infinite coffee. The barista knows your name." },

  // Tier 1 items (Coworking)
  { id: "standing_desk", name: "Standing Desk", emoji: "🧍", cost: 1000, tier: 1, description: "Stand up for your investments. Literally." },
  { id: "second_monitor", name: "Second Monitor", emoji: "🖥️", cost: 1500, tier: 1, description: "Two screens. Double the spreadsheets. Double the anxiety." },
  { id: "whiteboard", name: "Idea Whiteboard", emoji: "📋", cost: 800, tier: 1, description: "For writing 'FAIL FAST' in capital letters." },

  // Tier 2 items (Private Office)
  { id: "espresso_machine", name: "Espresso Machine", emoji: "☕", cost: 3000, tier: 2, description: "No more Starbucks. You ARE the Starbucks now." },
  { id: "office_plant", name: "Fiddle Leaf Fig", emoji: "🪴", cost: 500, tier: 2, description: "A plant you'll definitely keep alive this time." },
  { id: "guest_chair", name: "Leather Guest Chair", emoji: "🪑", cost: 2000, tier: 2, description: "For when founders come to pitch you. It squeaks intentionally." },

  // Tier 3 items (Corner Office)
  { id: "city_view", name: "City Skyline View", emoji: "🌆", cost: 10000, tier: 3, description: "The view that says 'I have arrived' without saying anything." },
  { id: "mahogany_desk", name: "Mahogany Desk", emoji: "🪵", cost: 15000, tier: 3, description: "Solid wood. You can feel the quality every time you bang your knee." },
  { id: "art_piece", name: "Abstract Art Piece", emoji: "🎨", cost: 8000, tier: 3, description: "It's just a red square. It cost $8k. You don't get it either." },

  // Tier 4 items (Penthouse)
  { id: "private_elevator", name: "Private Elevator", emoji: "🛗", cost: 50000, tier: 4, description: "No more small talk in the elevator. Ever." },
  { id: "fish_tank", name: "Wall Aquarium", emoji: "🐠", cost: 25000, tier: 4, description: "A 500-gallon saltwater tank. The fish are your only friends." },
  { id: "wine_fridge", name: "Wine Fridge", emoji: "🍷", cost: 12000, tier: 4, description: "500 bottles. You only drink the $12 ones." },

  // Tier 5 items (Private Island)
  { id: "helipad", name: "Helipad", emoji: "🚁", cost: 200000, tier: 5, description: "VCs fly in. You fly out. Everyone's flying." },
  { id: "shark_tank", name: "Shark Tank (Literal)", emoji: "🦈", cost: 500000, tier: 5, description: "A tank with real sharks. For when founders ask for too much equity." },
  { id: "volcano_lair", name: "Volcano Lair", emoji: "🌋", cost: 1000000, tier: 5, description: "Every supervillain needs one. You've earned it." },
];

// ── Load from localStorage ────────────────────────────────────
function loadState() {
  try {
    const saved = localStorage.getItem("adshark_office");
    if (saved) return JSON.parse(saved);
  } catch { /* ignore corrupt storage */ }
  return {
    totalEarnings: 0,        // cumulative profit across all sessions
    currentTier: 0,          // office tier index
    ownedItems: [],          // array of item IDs
    sessionsPlayed: 0,
  };
}

function saveState(state) {
  localStorage.setItem("adshark_office", JSON.stringify(state));
}

const useOfficeStore = create((set, get) => ({
  ...loadState(),

  getTier: () => OFFICE_TIERS[get().currentTier] || OFFICE_TIERS[0],
  getNextTier: () => OFFICE_TIERS[get().currentTier + 1] || null,
  getTiers: () => OFFICE_TIERS,
  getItemsForTier: (tierId) => OFFICE_ITEMS.filter(i => i.tier === tierId),
  getAllItems: () => OFFICE_ITEMS,

  addEarnings: (amount) => {
    const state = get();
    const newTotal = state.totalEarnings + Math.max(0, amount);
    const newState = { ...state, totalEarnings: newTotal, sessionsPlayed: state.sessionsPlayed + 1 };
    saveState(newState);
    set(newState);
    return newTotal;
  },

  upgradeOffice: () => {
    const state = get();
    const nextTier = OFFICE_TIERS[state.currentTier + 1];
    if (!nextTier) return false;
    if (state.totalEarnings < nextTier.cost) return false;
    const newState = {
      ...state,
      currentTier: state.currentTier + 1,
      totalEarnings: state.totalEarnings - nextTier.cost,
    };
    saveState(newState);
    set(newState);
    return true;
  },

  buyItem: (itemId) => {
    const state = get();
    const item = OFFICE_ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    if (state.ownedItems.includes(itemId)) return false;
    if (state.totalEarnings < item.cost) return false;
    const newState = {
      ...state,
      ownedItems: [...state.ownedItems, itemId],
      totalEarnings: state.totalEarnings - item.cost,
    };
    saveState(newState);
    set(newState);
    return true;
  },

  canAfford: (cost) => get().totalEarnings >= cost,

  reset: () => {
    const fresh = { totalEarnings: 0, currentTier: 0, ownedItems: [], sessionsPlayed: 0 };
    saveState(fresh);
    set(fresh);
  },
}));

export default useOfficeStore;
