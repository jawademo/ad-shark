import { create } from "zustand";
import { getLang } from "../i18n/lang.js";

// Names/descriptions are bilingual ({ en, es }); getters resolve them to the
// current language. Components that render office copy call useI18n(), so they
// re-render — and re-read these getters — when the language changes.

// ── Office tiers (visual progression) ─────────────────────────
const OFFICE_TIERS = [
  {
    id: 0,
    name: { en: "Coffee Shop Squatter", es: "Okupa de cafetería" },
    emoji: "☕",
    description: {
      en: "You're pitching from a Starbucks. The Wi-Fi keeps dropping. Someone is doing a podcast call next to you.",
      es: "Presentas desde un Starbucks. El Wi-Fi se cae. Alguien graba un podcast justo a tu lado.",
    },
    cost: 0,
    bgGradient: "from-amber-900/40 to-amber-950/60",
    accentColor: "#f59e0b",
  },
  {
    id: 1,
    name: { en: "Coworking Desk", es: "Escritorio de coworking" },
    emoji: "🪑",
    description: {
      en: "A hot desk at WeWork. Free coffee, sketchy Wi-Fi, and someone always reheating fish in the microwave.",
      es: "Un hot desk en WeWork. Café gratis, Wi-Fi dudoso y siempre alguien recalentando pescado en el microondas.",
    },
    cost: 5000,
    bgGradient: "from-slate-800/60 to-slate-900/80",
    accentColor: "#64748b",
  },
  {
    id: 2,
    name: { en: "Private Office", es: "Oficina privada" },
    emoji: "🚪",
    description: {
      en: "A real office with a door that closes. You can finally take calls without apologizing for background noise.",
      es: "Una oficina de verdad con una puerta que cierra. Por fin puedes tomar llamadas sin disculparte por el ruido de fondo.",
    },
    cost: 25000,
    bgGradient: "from-blue-900/40 to-slate-900/80",
    accentColor: "#3b82f6",
  },
  {
    id: 3,
    name: { en: "Corner Office", es: "Oficina de esquina" },
    emoji: "🏙️",
    description: {
      en: "Floor-to-ceiling windows. A view of the city. A mahogany desk. You've made it (almost).",
      es: "Ventanales de piso a techo. Vista a la ciudad. Un escritorio de caoba. Lo lograste (casi).",
    },
    cost: 100000,
    bgGradient: "from-indigo-900/50 to-slate-900/80",
    accentColor: "#6366f1",
  },
  {
    id: 4,
    name: { en: "Penthouse Suite", es: "Penthouse" },
    emoji: "🏛️",
    description: {
      en: "Top floor. Private elevator. A secretary named Margaret who screens your calls. You're basically Patrick Bateman (minus the... you know).",
      es: "Último piso. Ascensor privado. Una secretaria llamada Margaret que filtra tus llamadas. Eres básicamente Patrick Bateman (menos lo... ya sabes).",
    },
    cost: 500000,
    bgGradient: "from-purple-900/50 to-slate-900/80",
    accentColor: "#a855f7",
  },
  {
    id: 5,
    name: { en: "Private Island HQ", es: "Cuartel en isla privada" },
    emoji: "🏝️",
    description: {
      en: "You bought an island. Your office is the entire island. VCs fly in by helicopter. There's a shark tank in the lobby (literal sharks).",
      es: "Compraste una isla. Tu oficina es la isla entera. Los VCs llegan en helicóptero. Hay un tanque de tiburones en el lobby (tiburones de verdad).",
    },
    cost: 5000000,
    bgGradient: "from-emerald-900/50 to-slate-900/80",
    accentColor: "#10b981",
  },
];

// ── Office items (cosmetic + flex) ────────────────────────────
const OFFICE_ITEMS = [
  // Tier 0 items (Coffee Shop)
  { id: "laptop_sticker", name: { en: "Startup Sticker Pack", es: "Pack de stickers de startup" }, emoji: "📛", cost: 100, tier: 0, description: { en: "Slap 'em on your laptop. Now you look like a founder.", es: "Pégalos en tu laptop. Ahora pareces fundador." } },
  { id: "noise_cancelling", name: { en: "Noise-Cancelling Headphones", es: "Audífonos con cancelación de ruido" }, emoji: "🎧", cost: 500, tier: 0, description: { en: "Block out the podcast bro next to you.", es: "Bloquea al bro del podcast de al lado." } },
  { id: "cold_brew", name: { en: "Bottomless Cold Brew", es: "Cold brew sin fondo" }, emoji: "🧊", cost: 200, tier: 0, description: { en: "Infinite coffee. The barista knows your name.", es: "Café infinito. El barista sabe tu nombre." } },

  // Tier 1 items (Coworking)
  { id: "standing_desk", name: { en: "Standing Desk", es: "Escritorio de pie" }, emoji: "🧍", cost: 1000, tier: 1, description: { en: "Stand up for your investments. Literally.", es: "Ponte de pie por tus inversiones. Literalmente." } },
  { id: "second_monitor", name: { en: "Second Monitor", es: "Segundo monitor" }, emoji: "🖥️", cost: 1500, tier: 1, description: { en: "Two screens. Double the spreadsheets. Double the anxiety.", es: "Dos pantallas. El doble de hojas de cálculo. El doble de ansiedad." } },
  { id: "whiteboard", name: { en: "Idea Whiteboard", es: "Pizarra de ideas" }, emoji: "📋", cost: 800, tier: 1, description: { en: "For writing 'FAIL FAST' in capital letters.", es: "Para escribir 'FALLA RÁPIDO' en mayúsculas." } },

  // Tier 2 items (Private Office)
  { id: "espresso_machine", name: { en: "Espresso Machine", es: "Máquina de espresso" }, emoji: "☕", cost: 3000, tier: 2, description: { en: "No more Starbucks. You ARE the Starbucks now.", es: "Se acabó el Starbucks. Ahora TÚ eres el Starbucks." } },
  { id: "office_plant", name: { en: "Fiddle Leaf Fig", es: "Ficus lira" }, emoji: "🪴", cost: 500, tier: 2, description: { en: "A plant you'll definitely keep alive this time.", es: "Una planta que esta vez sí vas a mantener viva." } },
  { id: "guest_chair", name: { en: "Leather Guest Chair", es: "Silla de visita de cuero" }, emoji: "🪑", cost: 2000, tier: 2, description: { en: "For when founders come to pitch you. It squeaks intentionally.", es: "Para cuando los fundadores vengan a presentarte. Rechina a propósito." } },

  // Tier 3 items (Corner Office)
  { id: "city_view", name: { en: "City Skyline View", es: "Vista al skyline" }, emoji: "🌆", cost: 10000, tier: 3, description: { en: "The view that says 'I have arrived' without saying anything.", es: "La vista que dice 'he llegado' sin decir nada." } },
  { id: "mahogany_desk", name: { en: "Mahogany Desk", es: "Escritorio de caoba" }, emoji: "🪵", cost: 15000, tier: 3, description: { en: "Solid wood. You can feel the quality every time you bang your knee.", es: "Madera maciza. Sientes la calidad cada vez que te golpeas la rodilla." } },
  { id: "art_piece", name: { en: "Abstract Art Piece", es: "Obra de arte abstracto" }, emoji: "🎨", cost: 8000, tier: 3, description: { en: "It's just a red square. It cost $8k. You don't get it either.", es: "Es solo un cuadrado rojo. Costó $8k. Tú tampoco lo entiendes." } },

  // Tier 4 items (Penthouse)
  { id: "private_elevator", name: { en: "Private Elevator", es: "Ascensor privado" }, emoji: "🛗", cost: 50000, tier: 4, description: { en: "No more small talk in the elevator. Ever.", es: "Se acabó la charla incómoda en el ascensor. Para siempre." } },
  { id: "fish_tank", name: { en: "Wall Aquarium", es: "Acuario de pared" }, emoji: "🐠", cost: 25000, tier: 4, description: { en: "A 500-gallon saltwater tank. The fish are your only friends.", es: "Un tanque de agua salada de 500 galones. Los peces son tus únicos amigos." } },
  { id: "wine_fridge", name: { en: "Wine Fridge", es: "Cava de vino" }, emoji: "🍷", cost: 12000, tier: 4, description: { en: "500 bottles. You only drink the $12 ones.", es: "500 botellas. Solo tomas las de $12." } },

  // Tier 5 items (Private Island)
  { id: "helipad", name: { en: "Helipad", es: "Helipuerto" }, emoji: "🚁", cost: 200000, tier: 5, description: { en: "VCs fly in. You fly out. Everyone's flying.", es: "Los VCs aterrizan. Tú despegas. Todos volando." } },
  { id: "shark_tank", name: { en: "Shark Tank (Literal)", es: "Tanque de tiburones (literal)" }, emoji: "🦈", cost: 500000, tier: 5, description: { en: "A tank with real sharks. For when founders ask for too much equity.", es: "Un tanque con tiburones reales. Para cuando los fundadores pidan demasiado equity." } },
  { id: "volcano_lair", name: { en: "Volcano Lair", es: "Guarida en volcán" }, emoji: "🌋", cost: 1000000, tier: 5, description: { en: "Every supervillain needs one. You've earned it.", es: "Todo supervillano necesita una. Te la ganaste." } },
];

// Resolve a bilingual field ({ en, es }) to the active language.
function pickLang(field) {
  const lang = getLang();
  return field[lang] || field.en;
}

function localizeTier(tier) {
  if (!tier) return tier;
  return { ...tier, name: pickLang(tier.name), description: pickLang(tier.description) };
}

function localizeItem(item) {
  return { ...item, name: pickLang(item.name), description: pickLang(item.description) };
}

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

  getTier: () => localizeTier(OFFICE_TIERS[get().currentTier] || OFFICE_TIERS[0]),
  getNextTier: () => localizeTier(OFFICE_TIERS[get().currentTier + 1] || null),
  getTiers: () => OFFICE_TIERS.map(localizeTier),
  getItemsForTier: (tierId) => OFFICE_ITEMS.filter(i => i.tier === tierId).map(localizeItem),
  getAllItems: () => OFFICE_ITEMS.map(localizeItem),

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
