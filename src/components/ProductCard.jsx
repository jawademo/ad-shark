import { motion } from 'framer-motion'

export default function ProductCard({ product, compact = false }) {
  if (!product) return null

  const { name, tagline, categoryEmoji, categoryLabel, categoryColor, subcategory, targetMarket, price, signals } = product

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)' }}
    >
      {/* Header */}
      <div className="p-5 pb-3 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{categoryEmoji}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: `${categoryColor}25`, color: categoryColor, border: `1px solid ${categoryColor}40` }}
              >
                {categoryLabel} · {subcategory}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{name}</h2>
            <p className="text-sm text-white/60 mt-0.5 italic">"{tagline}"</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-amber-400">{price}</div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex gap-3 mt-3 text-xs text-white/50">
          <span>🎯 {targetMarket}</span>
        </div>
      </div>

      {/* Signals */}
      <div className={`p-5 pt-4 ${compact ? 'space-y-1.5' : 'space-y-2'}`}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Market Signals</p>
        {signals.map((signal, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-start gap-2.5 text-sm"
          >
            <span className="mt-0.5 text-base shrink-0">
              {signal.type === 'green' ? '✅' : '🚩'}
            </span>
            <span className={signal.type === 'green' ? 'text-emerald-300/90' : 'text-red-300/90'}>
              {signal.text}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
