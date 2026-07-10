import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import ProductCard from './ProductCard'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function ResultScreen() {
  const { lastResult, advanceToNext, balance } = useGameStore()
  const { t } = useI18n()

  if (!lastResult) return null

  const {
    won, passed, amount, profit, gained, product,
    outcomeLabel, successProb, betFraction, decisiveSignal, decisiveType, reason,
  } = lastResult
  const isPass = passed === true

  const oddsPct = successProb != null ? Math.round(successProb * 100) : null
  const betPct = betFraction != null ? Math.round(betFraction * 100) : null
  const oddsColor = oddsPct >= 60 ? '#10b981' : oddsPct >= 35 ? '#f59e0b' : '#ef4444'

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
            <h2 className="text-2xl font-black text-white">{t("result.passed")}</h2>
            <p className="text-white/50 mt-1 text-sm">
              {t("result.passedSub", { name: product?.name })}
            </p>
          </>
        ) : won ? (
          <>
            <h2 className="text-2xl font-black text-emerald-400">{t("result.winner")}</h2>
            <p className="text-white/80 mt-1.5 text-sm leading-snug">{outcomeLabel}</p>
            <div className="text-3xl font-black text-emerald-300 mt-3">
              {formatMoney(gained)}
            </div>
            <div className="text-white/40 text-sm mt-1">
              ${amount?.toLocaleString()} → ${profit?.toLocaleString()} · {lastResult.multiplier?.toFixed(1)}x
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-red-400">{t("result.flopped")}</h2>
            <p className="text-white/80 mt-1.5 text-sm leading-snug">{outcomeLabel}</p>
            <div className="text-3xl font-black text-red-300 mt-3">
              {formatMoney(-amount)}
            </div>
            <div className="text-white/40 text-sm mt-1">
              {t("result.lost", { amount: amount?.toLocaleString() })}
            </div>
          </>
        )}

        {/* Balance */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="text-white/40 text-sm">{t("result.balance")}</span>
          <span className="font-bold text-amber-400">${balance?.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* The verdict — why it happened */}
      {(reason || decisiveSignal || oddsPct != null) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/10 p-4 space-y-3"
          style={{ background: '#12121f' }}
        >
          <p className="text-white/30 text-xs uppercase tracking-wider">
            {isPass ? t("result.whatDodged") : t("result.verdict")}
          </p>

          {reason && (
            <p className="text-white/80 text-sm leading-snug">{reason}</p>
          )}

          {decisiveSignal && (
            <div
              className={`flex items-start gap-2 rounded-lg p-2.5 text-sm ${
                decisiveType === 'green'
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-red-500/10 text-red-300'
              }`}
            >
              <span>{decisiveType === 'green' ? '✅' : '🚩'}</span>
              <span className="leading-snug">{decisiveSignal}</span>
            </div>
          )}

          {oddsPct != null && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">{t("result.realOdds")}</span>
                <span className="font-bold" style={{ color: oddsColor }}>
                  {oddsPct}%{!isPass && betPct ? t("result.youBet", { pct: betPct }) : ''}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${oddsPct}%` }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: oddsColor }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Product recap */}
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2 px-1">{t("result.productRecap")}</p>
          <ProductCard product={product} compact />
        </motion.div>
      )}

      {/* Next button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={advanceToNext}
        className="w-full py-4 rounded-2xl font-black text-black text-lg transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
      >
        {t("result.nextDeal")}
      </motion.button>
    </motion.div>
  )
}
