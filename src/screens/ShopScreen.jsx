import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2, Zap, Coins } from "lucide-react";
import { shopApi } from "../services/api.js";

export default function ShopScreen() {
  const [boosters, setBoosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoosters();
  }, []);

  const loadBoosters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shopApi.getBoosters();
      setBoosters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load shop");
    } finally {
      setLoading(false);
    }
  };

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
          Retry
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

  const rarityBg = {
    common: "bg-white/5",
    uncommon: "bg-green-500/5",
    rare: "bg-blue-500/5",
    legendary: "bg-purple-500/5",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-amber-400" />
        Booster Shop
      </h2>
      <p className="text-white/40 text-sm">Spend Shark Coins on power-ups for your next session.</p>

      {boosters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No boosters available yet.</p>
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
                    {booster.rarity}
                  </span>
                </div>
                <p className="text-white/50 text-sm mt-1">{booster.description}</p>
                {booster.owned_quantity > 0 && (
                  <p className="text-green-400 text-xs mt-1">
                    Owned: {booster.owned_quantity}
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
                Buy
              </button>
            </div>

            {!booster.usable_in_daily && (
              <p className="text-white/20 text-xs mt-2">Not usable in Daily Challenges</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
