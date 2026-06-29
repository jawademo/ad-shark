import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  if (!product) {
    return (
      <div className="rounded-2xl border border-white/10 p-6 space-y-4 text-center"
        style={{ background: '#12121f' }}>
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  const categoryColors = {
    "AI & Tech": "from-blue-500/20 to-purple-500/20 border-blue-500/30",
    "DTC Brands": "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    "Food & Beverage": "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    "Hardware": "from-gray-500/20 to-slate-500/20 border-gray-500/30",
    "Health & Wellness": "from-green-500/20 to-emerald-500/20 border-green-500/30",
    "Finance": "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
    "Social Media": "from-pink-500/20 to-fuchsia-500/20 border-pink-500/30",
    "Sustainability": "from-lime-500/20 to-green-500/20 border-lime-500/30",
    "Absurd/Meme": "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    "Wildcard": "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
  };

  const colors = categoryColors[product.category] || "from-white/5 to-white/5 border-white/20";

  const difficultyDots = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`inline-block w-2 h-2 rounded-full ${
        i < (product.difficulty || 0) ? "bg-amber-400" : "bg-white/20"
      }`}
    />
  ));

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border bg-gradient-to-br ${colors} p-5 space-y-4`}
      style={{ background: '#12121f' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{product.name}</h2>
          <p className="text-amber-400 text-sm font-medium mt-0.5">{product.tagline}</p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          product.rarity === 'legendary'
            ? 'border-purple-400 text-purple-400 bg-purple-400/10'
            : product.rarity === 'rare'
            ? 'border-blue-400 text-blue-400 bg-blue-400/10'
            : product.rarity === 'uncommon'
            ? 'border-green-400 text-green-400 bg-green-400/10'
            : 'border-white/20 text-white/60 bg-white/5'
        }`}>
          {product.rarity}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>

      {/* Market Signals */}
      {product.market_signals?.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">Market Signals</span>
          <div className="flex flex-wrap gap-1.5">
            {product.market_signals.map((signal, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-white/60"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/60">
          {product.categoryEmoji ? `${product.categoryEmoji} ` : ""}
          {product.categoryLabel || product.category}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white/40">Difficulty:</span>
          <div className="flex gap-1">{difficultyDots}</div>
        </div>
      </div>
    </motion.div>
  );
}
