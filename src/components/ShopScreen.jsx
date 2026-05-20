import { motion } from 'framer-motion'
import useGameStore, { OFFICE_UPGRADES } from '../store/gameStore'

export default function ShopScreen() {
  const { balance, owned, buyUpgrade } = useGameStore()

  const formatMoney = (n) => `$${n.toLocaleString()}`

  const sortedUpgrades = [...OFFICE_UPGRADES].sort((a, b) => a.price - b.price)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white">Your Setup 🏠</h2>
        <span className="text-amber-400 font-bold">{formatMoney(balance)}</span>
      </div>

      {/* Owned items */}
      {owned.length > 0 && (
        <div className="rounded-2xl border border-white/10 p-4"
          style={{ background: '#12121f' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Owned</p>
          <div className="flex flex-wrap gap-2">
            {OFFICE_UPGRADES.filter(u => owned.includes(u.id)).map(u => (
              <span key={u.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-sm text-emerald-300">
                {u.emoji} {u.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Available upgrades */}
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider px-1">Available</p>
        {sortedUpgrades.filter(u => !owned.includes(u.id)).map((upgrade, i) => {
          const canAfford = balance >= upgrade.price
          return (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-xl border border-white/10 p-4"
              style={{ background: '#12121f' }}
            >
              <span className="text-3xl">{upgrade.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white">{upgrade.name}</div>
                <div className="text-sm text-white/40">{upgrade.description}</div>
              </div>
              <button
                onClick={() => buyUpgrade(upgrade.id)}
                disabled={!canAfford}
                className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  canAfford
                    ? 'text-black active:scale-95'
                    : 'text-white/30 bg-white/5 cursor-not-allowed'
                }`}
                style={canAfford ? { background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' } : {}}
              >
                {formatMoney(upgrade.price)}
              </button>
            </motion.div>
          )
        })}
      </div>

      {owned.length === OFFICE_UPGRADES.length && (
        <div className="text-center py-8 text-white/40">
          <div className="text-4xl mb-2">🏆</div>
          <p>You own everything. Absolute unit.</p>
        </div>
      )}
    </div>
  )
}
