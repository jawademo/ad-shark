import { create } from "zustand";
import { gameApi } from "../services/api.ts";
import { v4 as uuidv4 } from "uuid";

const useGameStore = create((set, get) => ({
  // Session state
  sessionId: null,
  mode: "classic",
  status: "idle", // idle | loading | playing | revealing | ended
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

  // Round reveal (shown between products)
  lastResult: null,

  // Session results
  sessionResult: null,

  // ── Actions ──────────────────────────────────────────────────────

  startSession: async (mode = "classic") => {
    set({ status: "loading", error: null });

    try {
      // Check for challenge products in sessionStorage (from challenge link)
      const challengeProducts = sessionStorage.getItem("challenge_products");
      const isChallengeMode = mode === "challenge" || new URLSearchParams(window.location.search).get("mode") === "challenge";
      if (challengeProducts && isChallengeMode) {
        const products = JSON.parse(challengeProducts);
        const session = await gameApi.createSession("challenge");
        set({
          sessionId: session.id,
          mode: "challenge",
          balance: 10000,
          startingBalance: 10000,
          products,
          currentProductIndex: 0,
          currentProduct: products[0] || null,
          rounds: [],
          currentRound: null,
          sessionResult: null,
          status: "playing",
        });
        return;
      }

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
      const passed = decision === "pass";
      const profitLoss = result.profit_loss || 0;

      set({
        rounds: newRounds,
        currentRound: roundData,
        balance: result.new_balance,
        status: "revealing",
        lastResult: {
          passed,
          won: !passed && profitLoss > 0,
          amount: result.investment_amount || 0,
          profit: (result.investment_amount || 0) + profitLoss,
          gained: profitLoss,
          product: currentProduct,
          multiplier: result.outcome_multiplier,
          outcomeLabel: result.outcome_revealed,
        },
      });
    } catch (err) {
      set({
        status: "playing",
        error: err.message || "Failed to process round",
      });
      throw err;
    }
  },

  advanceToNext: async () => {
    const { currentProductIndex, products } = get();
    const nextIndex = currentProductIndex + 1;
    const next = products[nextIndex] || null;

    set({
      currentProductIndex: nextIndex,
      currentProduct: next,
      lastResult: null,
      status: next ? "playing" : "ended",
    });

    if (!next) {
      await get().endSession();
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
      lastResult: null,
      sessionResult: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useGameStore;
