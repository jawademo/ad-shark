import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useGameStore from './store/gameStore'
import ProductCard from './components/ProductCard'
import InvestScreen from './components/InvestScreen'
import ResultScreen from './components/ResultScreen'
import ShopScreen from './components/ShopScreen'
import StatsScreen from './components/StatsScreen'

const TABS = [
  { id: 'play', label: 'Play', emoji: '🎮' },
  { id: 'shop', label: 'Shop', emoji: '🏠' },
  { id: 'stats', label: 'Stats', emoji: '📊' },
]

export default function App() {
  const { currentProduct, phase, nextProduct, balance, owned } = useGameStore()
  const [tab, setTab] = useState('play')

  // Boot: load first product
  useEffect(() => {
    if (!currentProduct) nextProduct()
  }, [])

  const formatMoney = (n) => `$${n.toLocaleString()}`

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3 border-b border-white/5"
        style={{ background: '#0a0a0f' }}>
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              🦈 Ad Shark
            </h1>
            <p className="text-white/30 text-xs">Spot the winners. Skip the flops.</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-amber-400">{formatMoney(balance)}</div>
            <div className="text-white/30 text-xs">{owned.length} items owned</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {tab === 'play' && (
            <motion.div
              key="play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {phase === 'viewing' && currentProduct && (
                <motion.div className="space-y-4">
                  <ProductCard product={currentProduct} />
                  <div className="flex gap-3">
                    <button
                      onClick={() => useGameStore.getState().pass()}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-white/60 border border-white/10 hover:bg-white/5 transition-all"
                    >
                      PASS 🙅
                    </button>
                    <button
                      onClick={() => useGameStore.getState().setPhase('investing')}
                      className="flex-[2] py-3.5 rounded-2xl font-black text-black text-lg transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
                    >
                      INVEST 💰
                    </button>
                  </div>
                </motion.div>
              )}

              {phase === 'investing' && <InvestScreen />}
              {phase === 'result' && <ResultScreen />}
            </motion.div>
          )}

          {tab === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ShopScreen />
            </motion.div>
          )}

          {tab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StatsScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="sticky bottom-0 border-t border-white/10 px-4 pb-safe"
        style={{ background: '#0a0a0f' }}>
        <div className="flex max-w-lg mx-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all ${
                tab === t.id ? 'text-amber-400' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
