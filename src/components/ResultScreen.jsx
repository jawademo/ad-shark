import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore'
import ProductCard from './ProductCard'

export default function ResultScreen() {
  const { lastResult, nextProduct, balance } = useGameStore()

  if (!lastResult) return null

  const { won, passed, amount, profit, gained, product } = lastResult
  const isPass = passed === true

  const formatMoney = (n) => {
    const abs = Math.abs(n)
    const sign = n >= 0 ? '+' : '-'
    return `${sign}$${abs.toLocaleString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-4"
    >
      {/* Result Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 text-center border ${
          isPass
            ? 'bg-white/5 border-white/10'
            : won
            ? 'border-emerald-500/30 success-glow'
            : 'border-red-500/30 fail-glow'
        }`}
        style={{
          background: isPass
            ? '#1a1a2e'
            : won
            ? 'linear-gradient(135deg, #052e16, #14532d)'
            : 'linear-gradient(135deg, #450a0a, #7f1d1d)',
        }}
      >
        <div className="text-5xl mb-3">
          {isPass ? '🙅' : won ? '🚀' : '💀'}
        </div>

        {isPass ? (
          <>
            <h2 className="text-2xl font-black text-white">Passed</h2>
            <p className="text-white/50 mt-1 text-sm">
              {product?.name} — you sat this one out.
            </p>
          </>
        ) : won ? (
          <>
            <h2 className="text-2xl font-black text-emerald-400">WINNER!</h2>
            <p className="text-white/70 mt-1">{product?.name} was a hit 🎉</p>
            <div className="text-3xl font-black text-emerald-300 mt-3">
              {formatMoney(gained)}
            </div>
            <div className="text-white/40 text-sm mt-1">
              ${amount?.toLocaleString()} → ${profit?.toLocaleString()} · {lastResult.multiplier?.toFixed(1)}x
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-red-400">FLOPPED</h2>
            <p className="text-white/70 mt-1">{product?.name} crashed and burned 💸</p>
            <div className="text-3xl font-black text-red-300 mt-3">
              {formatMoney(-amount)}
            </div>
            <div className="text-white/40 text-sm mt-1">
              Lost ${amount?.toLocaleString()}
            </div>
          </>
        )}

        {/* Balance */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="text-white/40 text-sm">Balance: </span>
          <span className="font-bold text-amber-400">${balance?.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Product recap */}
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2 px-1">Product recap</p>
          <ProductCard product={product} compact />
        </motion.div>
      )}

      {/* Next button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={nextProduct}
        className="w-full py-4 rounded-2xl font-black text-black text-lg transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
      >
        Next Deal →
      </motion.button>
    </motion.div>
  )
}
