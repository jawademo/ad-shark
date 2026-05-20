import { useState } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import useGameStore from '../store/gameStore'

const QUICK_PERCENTS = [10, 25, 50, 100]

export default function InvestScreen() {
  const { currentProduct, balance, invest, pass } = useGameStore()
  const [amount, setAmount] = useState(Math.floor(balance * 0.1))

  const pct = balance > 0 ? Math.round((amount / balance) * 100) : 0

  const handleSlider = (e) => {
    setAmount(Math.floor((e.target.value / 100) * balance))
  }

  const setQuick = (p) => setAmount(Math.floor((p / 100) * balance))

  const formatMoney = (n) => `$${n.toLocaleString()}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      <ProductCard product={currentProduct} />

      {/* Investment Panel */}
      <div className="rounded-2xl border border-white/10 p-5 space-y-4"
        style={{ background: '#12121f' }}>

        <div className="flex justify-between items-center">
          <span className="text-white/50 text-sm">Your balance</span>
          <span className="font-bold text-amber-400">{formatMoney(balance)}</span>
        </div>

        {/* Bet amount display */}
        <div className="text-center">
          <div className="text-4xl font-black text-white">{formatMoney(amount)}</div>
          <div className="text-white/40 text-sm mt-1">{pct}% of your balance</div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={handleSlider}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #f59e0b ${pct}%, #ffffff20 ${pct}%)`,
            outline: 'none',
          }}
        />

        {/* Quick picks */}
        <div className="flex gap-2">
          {QUICK_PERCENTS.map((p) => (
            <button
              key={p}
              onClick={() => setQuick(p)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                pct === p
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {p === 100 ? 'ALL IN' : `${p}%`}
            </button>
          ))}
        </div>

        {/* Potential return */}
        {amount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center"
          >
            <span className="text-emerald-400 text-sm">
              Potential return: <strong>{formatMoney(Math.floor(amount * currentProduct?.returnMultiplier))}</strong>
              <span className="text-white/40"> · {currentProduct?.returnMultiplier?.toFixed(1)}x</span>
            </span>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={pass}
            className="flex-1 py-3.5 rounded-xl font-bold text-white/60 border border-white/10 hover:bg-white/5 transition-all"
          >
            PASS 🙅
          </button>
          <button
            onClick={() => invest(amount)}
            disabled={amount <= 0}
            className="flex-[2] py-3.5 rounded-xl font-black text-black text-lg transition-all disabled:opacity-30"
            style={{
              background: amount > 0 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : '#666',
            }}
          >
            INVEST 💰
          </button>
        </div>
      </div>
    </motion.div>
  )
}
