import { create } from "zustand";
import { gameApi } from "../services/api.js";
import { v4 as uuidv4 } from "uuid";

const useGameStore = create((set, get) => ({
  // Session state
  sessionId: null,
  mode: "classic",
  status: "idle", // idle | loading | playing | ended
  error: null,

  // Financial state
  balance: 10000,
  startingBalance: 10000,

  // Products
  products: [],
  currentProductIndex: 0,
  currentProduct: null,

  // Round history
  rounds: [],
  currentRound: null,

  // Session results
  sessionResult: null,

  // ── Actions ──────────────────────────────────────────────────────

  startSession: async (mode = "classic") => {
    set({ status: "loading", error: null });

    try {
      const session = await gameApi.createSession(mode);
      set({
        sessionId: session.id,
        mode: session.mode,
        balance: session.starting_balance,
        startingBalance: session.starting_balance,
        products: session.products,
        currentProductIndex: 0,
        currentProduct: session.products[0] || null,
        rounds: [],
        currentRound: null,
        sessionResult: null,
        status: "playing",
      });
    } catch (err) {
      set({
        status: "idle",
        error: err.message || "Failed to start session",
      });
      throw err;
    }
  },

  makeDecision: async (decision, investmentAmount = 0) => {
    const { sessionId, currentProduct, balance } = get();
    if (!sessionId || !currentProduct) return;

    set({ status: "loading" });

    const nonce = uuidv4();

    try {
      const result = await gameApi.playRound(sessionId, {
        product_id: currentProduct.id,
        decision,
        investment_amount: decision === "pass" ? 0 : investmentAmount,
        nonce,
      });

      const roundData = {
        ...result,
        product: currentProduct,
      };

      const newRounds = [...get().rounds, roundData];
      const nextIndex = get().currentProductIndex + 1;
      const nextProduct = get().products[nextIndex] || null;

      set({
        rounds: newRounds,
        currentRound: roundData,
        balance: result.new_balance,
        currentProductIndex: nextIndex,
        currentProduct: nextProduct,
        status: nextProduct ? "playing" : "ended",
      });

      // Auto-end session if no more products
      if (!nextProduct) {
        await get().endSession();
      }
    } catch (err) {
      set({
        status: "playing",
        error: err.message || "Failed to process round",
      });
      throw err;
    }
  },

  endSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const result = await gameApi.endSession(sessionId);
      set({
        sessionResult: result,
        status: "ended",
      });
      return result;
    } catch (err) {
      set({ error: err.message || "Failed to end session" });
      throw err;
    }
  },

  resetGame: () => {
    set({
      sessionId: null,
      status: "idle",
      error: null,
      balance: 10000,
      startingBalance: 10000,
      products: [],
      currentProductIndex: 0,
      currentProduct: null,
      rounds: [],
      currentRound: null,
      sessionResult: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useGameStore;
