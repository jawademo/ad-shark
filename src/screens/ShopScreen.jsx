import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2, Zap, Coins } from "lucide-react";
import { shopApi } from "../services/api.ts";
import { useI18n } from "../i18n/LanguageContext.jsx";

export default function ShopScreen() {
  const { t } = useI18n();
  const [boosters, setBoosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBoosters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shopApi.getBoosters();
      setBoosters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || t("shop.errLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadBoosters();
  }, [loadBoosters]);

  const handleBuy = async (booster) => {
    try {
      await shopApi.buyBooster(booster.id);
      await loadBoosters(); // Refresh to update inventory
    } catch (err) {
      alert(err.message || "Purchase failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <ShoppingBag className="w-10 h-10 text-gray-600" />
        <p className="text-gray-400">{error}</p>
        <button
          onClick={loadBoosters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  const rarityColors = {
    common: "border-white/20",
    uncommon: "border-green-500/30",
    rare: "border-blue-500/30",
    legendary: "border-purple-500/30",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-amber-400" />
        {t("shop.title")}
      </h2>
      <p className="text-white/40 text-sm">{t("shop.subtitle")}</p>

      {boosters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("shop.empty")}</p>
        </div>
      )}

      <div className="space-y-3">
        {boosters.map((booster, i) => (
          <motion.div
            key={booster.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-4 ${rarityColors[booster.rarity] || rarityColors.common}`}
            style={{ background: '#12121f' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{booster.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    booster.rarity === 'legendary'
                      ? 'bg-purple-500/10 text-purple-300'
                      : booster.rarity === 'rare'
                      ? 'bg-blue-500/10 text-blue-300'
                      : booster.rarity === 'uncommon'
                      ? 'bg-green-500/10 text-green-300'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {t(`rarity.${booster.rarity}`)}
                  </span>
                </div>
                <p className="text-white/50 text-sm mt-1">{booster.description}</p>
                {booster.owned_quantity > 0 && (
                  <p className="text-green-400 text-xs mt-1">
                    {t("shop.owned", { n: booster.owned_quantity })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Coins className="w-3.5 h-3.5" />
                {booster.cost_shark_coins} SC
              </span>
              <button
                onClick={() => handleBuy(booster)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                {t("shop.buy")}
              </button>
            </div>

            {!booster.usable_in_daily && (
              <p className="text-white/20 text-xs mt-2">{t("shop.notDaily")}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
