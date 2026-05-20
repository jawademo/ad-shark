import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'

export default function StatsScreen() {
  const { balance, totalEarned, totalLost, roundsPlayed, correctPredictions, history, resetGame } = useGameStore()

  const winRate = roundsPlayed > 0 ? Math.round((correctPredictions / roundsPlayed) * 100) : 0
  const formatMoney = (n) => `$${n.toLocaleString()}`
  const netProfit = totalEarned - totalLost

  const stats = [
    { label: 'Balance', value: formatMoney(balance), emoji: '💰', color: '#f59e0b' },
    { label: 'Win Rate', value: `${winRate}%`, emoji: '🎯', color: '#6366f1' },
    { label: 'Deals Seen', value: roundsPlayed, emoji: '📊', color: '#06b6d4' },
    { label: 'Net P&L', value: formatMoney(netProfit), emoji: netProfit >= 0 ? '📈' : '📉', color: netProfit >= 0 ? '#10b981' : '#ef4444' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white">Your Stats 📊</h2>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-white/10 p-4"
            style={{ background: '#12121f' }}
          >
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-white/10 p-4 space-y-2"
          style={{ background: '#12121f' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Recent Deals</p>
          {history.slice(0, 10).map((h, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span>{h.passed ? '🙅' : h.won ? '✅' : '❌'}</span>
              <span className="flex-1 text-white/70 truncate">{h.product?.name}</span>
              <span className={h.passed ? 'text-white/30' : h.won ? 'text-emerald-400' : 'text-red-400'}>
                {h.passed ? 'Pass' : h.won ? `+$${h.gained?.toLocaleString()}` : `-$${h.amount?.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => { if (confirm('Reset all progress?')) resetGame() }}
        className="w-full py-3 rounded-xl border border-red-500/20 text-red-400/60 text-sm hover:bg-red-500/10 transition-all"
      >
        Reset Game
      </button>
    </div>
  )
}
