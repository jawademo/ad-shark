import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useOfficeStore from "../store/officeStore.js";
import { TrendingUp, Lock, Check, Sparkles } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext.jsx";

export default function OfficeScreen() {
  const { t } = useI18n();
  const {
    totalEarnings, currentTier, ownedItems, sessionsPlayed,
    getTier, getNextTier, getTiers, getAllItems,
    upgradeOffice, buyItem, canAfford,
  } = useOfficeStore();

  const [showItems, setShowItems] = useState(true);
  const tier = getTier();
  const nextTier = getNextTier();
  const allTiers = getTiers();
  const allItems = getAllItems();
  const formatMoney = (n) => `$${(n || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(180deg, #0a0a17 0%, #12121f 100%)" }}>
      {/* ── Office Visual ─────────────────────────────── */}
      <div className={`relative h-64 bg-gradient-to-b ${tier.bgGradient} overflow-hidden`}>
        {/* Office emoji scene */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={tier.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="text-8xl drop-shadow-2xl"
          >
            {tier.emoji}
          </motion.div>
        </div>

        {/* Owned items floating around */}
        {ownedItems.map((itemId, i) => {
          const item = allItems.find(it => it.id === itemId);
          if (!item) return null;
          const angle = (i * 360) / Math.max(ownedItems.length, 1);
          const radius = 90;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          return (
            <motion.div
              key={itemId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              className="absolute text-3xl"
              style={{
                left: `calc(50% + ${x}px - 16px)`,
                top: `calc(50% + ${y}px - 16px)`,
              }}
            >
              {item.emoji}
            </motion.div>
          );
        })}

        {/* Tier badge */}
        <div className="absolute top-4 left-4">
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold text-black flex items-center gap-1"
            style={{ background: tier.accentColor }}
          >
            <Sparkles className="w-3 h-3" />
            {tier.name}
          </div>
        </div>

        {/* Earnings badge */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/40 backdrop-blur text-amber-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {t("office.earned", { amount: formatMoney(totalEarnings) })}
          </div>
        </div>
      </div>

      {/* ── Office Info ─────────────────────────────── */}
      <div className="px-4 -mt-6 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl border border-white/10 p-5 space-y-3"
          style={{ background: "#12121f" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black text-white">{tier.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{tier.description}</p>
            </div>
            <span className="text-4xl">{tier.emoji}</span>
          </div>

          <div className="flex gap-4 text-xs text-gray-500 pt-2 border-t border-white/5">
            <span>📊 {t("office.sessionsPlayed", { n: sessionsPlayed })}</span>
            <span>🏆 {t("office.itemsOwned", { n: ownedItems.length })}</span>
          </div>
        </motion.div>

        {/* ── Upgrade Office ─────────────────────────── */}
        {nextTier ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 rounded-2xl border border-amber-500/20 p-5 space-y-3"
            style={{ background: "#1a1a0a" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{nextTier.emoji}</span>
              <div className="flex-1">
                <h3 className="text-white font-bold">{t("office.upgradeTo", { name: nextTier.name })}</h3>
                <p className="text-gray-500 text-xs">{nextTier.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-black text-lg">{formatMoney(nextTier.cost)}</span>
              <button
                onClick={() => {
                  const success = upgradeOffice();
                  if (!success) {
                    // Flash the button or show a message
                  }
                }}
                disabled={!canAfford(nextTier.cost)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  canAfford(nextTier.cost)
                    ? "bg-amber-500 hover:bg-amber-400 text-black"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
              >
                {canAfford(nextTier.cost) ? t("office.upgradeNow") : t("office.needMore", { amount: formatMoney(nextTier.cost - totalEarnings) })}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 rounded-2xl border border-emerald-500/20 p-5 text-center"
            style={{ background: "#0a1a0a" }}
          >
            <span className="text-4xl">👑</span>
            <h3 className="text-white font-bold mt-2">{t("office.maxTier")}</h3>
            <p className="text-gray-500 text-sm">{t("office.maxTierDesc")}</p>
          </motion.div>
        )}

        {/* ── Tier Progress Bar ──────────────────────── */}
        <div className="mt-4 flex gap-1">
          {allTiers.map((t, i) => (
            <div
              key={t.id}
              className={`flex-1 h-2 rounded-full transition-all ${
                i <= currentTier ? "" : "bg-white/5"
              }`}
              style={i <= currentTier ? { background: t.accentColor } : {}}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          {allTiers.map(t => (
            <span key={t.id} className="flex-1 text-center">{t.emoji}</span>
          ))}
        </div>

        {/* ── Shop Items ─────────────────────────────── */}
        <div className="mt-6">
          <button
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between mb-3"
          >
            <h3 className="text-white font-bold text-lg">{t("office.decor")}</h3>
            <span className="text-gray-500 text-sm">{showItems ? t("office.hide") : t("office.show")}</span>
          </button>

          <AnimatePresence>
            {showItems && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {/* Items for current tier */}
                {allItems.filter(item => item.tier <= currentTier).map((item) => {
                  const owned = ownedItems.includes(item.id);
                  const affordable = canAfford(item.cost);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        owned ? "border-emerald-500/20" : "border-white/5"
                      }`}
                      style={{ background: owned ? "#0a1a0a" : "#12121f" }}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{item.name}</p>
                        <p className="text-gray-500 text-xs truncate">{item.description}</p>
                      </div>
                      {owned ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold">
                          <Check className="w-3 h-3" /> {t("office.ownedTag")}
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-amber-400 font-bold text-sm">{formatMoney(item.cost)}</span>
                          <button
                            onClick={() => buyItem(item.id)}
                            disabled={!affordable}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              affordable
                                ? "bg-amber-500 hover:bg-amber-400 text-black"
                                : "bg-white/5 text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            {affordable ? t("office.buy") : "🔒"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Locked items (next tier) */}
                {allItems.filter(item => item.tier === currentTier + 1).length > 0 && (
                  <>
                    <p className="text-gray-600 text-xs mt-4 mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {t("office.unlockAt", { name: nextTier?.name || t("office.nextTier") })}
                    </p>
                    {allItems.filter(item => item.tier === currentTier + 1).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/5 opacity-40"
                        style={{ background: "#12121f" }}
                      >
                        <span className="text-2xl grayscale">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{item.name}</p>
                          <p className="text-gray-500 text-xs truncate">{item.description}</p>
                        </div>
                        <span className="text-gray-600 text-xs">🔒</span>
                      </div>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
