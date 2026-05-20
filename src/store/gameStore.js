import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateProduct } from '../services/productGenerator'

const STARTING_BALANCE = 10_000
const OFFICE_UPGRADES = [
  { id: 'desk', name: 'Better Desk', emoji: '🪑', price: 500, description: 'A real desk. Not a folding table.' },
  { id: 'monitor', name: 'Ultrawide Monitor', emoji: '🖥️', price: 1200, description: '34" ultrawide. See more, miss nothing.' },
  { id: 'chair', name: 'Ergonomic Chair', emoji: '💺', price: 800, description: 'Your back will thank you.' },
  { id: 'coffee', name: 'Espresso Machine', emoji: '☕', price: 600, description: 'Fuel-grade coffee on demand.' },
  { id: 'plant', name: 'Office Plant', emoji: '🌿', price: 150, description: 'Vibes. Pure vibes.' },
  { id: 'lamp', name: 'LED Halo Lamp', emoji: '💡', price: 250, description: 'Look good on camera. Always.' },
  { id: 'headphones', name: 'Noise-Cancel Headphones', emoji: '🎧', price: 350, description: 'Block the world. Focus up.' },
  { id: 'keyboard', name: 'Mechanical Keyboard', emoji: '⌨️', price: 200, description: 'Satisfying clicks. Faster inputs.' },
  { id: 'apartment', name: 'Apartment Upgrade', emoji: '🏠', price: 5000, description: 'Move out of the studio. Finally.' },
  { id: 'car', name: 'New Car', emoji: '🚗', price: 15000, description: 'Flexing optional. Speed mandatory.' },
  { id: 'penthouse', name: 'Penthouse Suite', emoji: '🏙️', price: 50000, description: 'You made it.' },
]

const useGameStore = create(
  persist(
    (set, get) => ({
      // ---- State ----
      balance: STARTING_BALANCE,
      totalEarned: 0,
      totalLost: 0,
      roundsPlayed: 0,
      correctPredictions: 0,
      currentProduct: null,
      history: [],          // last 20 results
      owned: [],            // purchased upgrade ids
      phase: 'viewing',     // viewing | investing | result
      lastResult: null,     // { won, amount, multiplier, product }
      generatorStrategy: 'random', // 'random' | 'llm'

      // ---- Actions ----
      nextProduct: () => {
        const strategy = get().generatorStrategy
        set({
          currentProduct: generateProduct(strategy),
          phase: 'viewing',
          lastResult: null,
        })
      },

      invest: (amount) => {
        const { currentProduct, balance } = get()
        if (!currentProduct || amount <= 0 || amount > balance) return

        const won = Math.random() < currentProduct.successProb
        const profit = won
          ? Math.floor(amount * currentProduct.returnMultiplier)
          : 0
        const newBalance = won ? balance - amount + profit : balance - amount
        const gained = won ? profit - amount : -amount

        const result = {
          won,
          amount,
          profit,
          gained,
          multiplier: currentProduct.returnMultiplier,
          product: currentProduct,
          timestamp: Date.now(),
        }

        set((s) => ({
          balance: newBalance,
          totalEarned: won ? s.totalEarned + profit : s.totalEarned,
          totalLost: won ? s.totalLost : s.totalLost + amount,
          roundsPlayed: s.roundsPlayed + 1,
          correctPredictions: won ? s.correctPredictions + 1 : s.correctPredictions,
          phase: 'result',
          lastResult: result,
          history: [result, ...s.history].slice(0, 20),
        }))
      },

      pass: () => {
        set((s) => ({
          roundsPlayed: s.roundsPlayed + 1,
          phase: 'result',
          lastResult: { won: null, passed: true, product: s.currentProduct },
        }))
      },

      buyUpgrade: (upgradeId) => {
        const { balance, owned } = get()
        const upgrade = OFFICE_UPGRADES.find(u => u.id === upgradeId)
        if (!upgrade || owned.includes(upgradeId) || balance < upgrade.price) return
        set((s) => ({
          balance: s.balance - upgrade.price,
          owned: [...s.owned, upgradeId],
        }))
      },

      setPhase: (phase) => set({ phase }),

      resetGame: () => set({
        balance: STARTING_BALANCE,
        totalEarned: 0,
        totalLost: 0,
        roundsPlayed: 0,
        correctPredictions: 0,
        currentProduct: null,
        history: [],
        owned: [],
        phase: 'viewing',
        lastResult: null,
      }),

      setStrategy: (strategy) => set({ generatorStrategy: strategy }),
    }),
    {
      name: 'ad-shark-save',
      partialize: (s) => ({
        balance: s.balance,
        totalEarned: s.totalEarned,
        totalLost: s.totalLost,
        roundsPlayed: s.roundsPlayed,
        correctPredictions: s.correctPredictions,
        history: s.history,
        owned: s.owned,
        generatorStrategy: s.generatorStrategy,
      }),
    }
  )
)

export { OFFICE_UPGRADES }
export default useGameStore
