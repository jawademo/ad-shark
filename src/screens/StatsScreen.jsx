import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { profileApi } from "../services/api.ts";
import useAuthStore from "../store/authStore.js";

export default function StatsScreen() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [location]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (n) => {
    const num = n ?? 0;
    const abs = Math.abs(num);
    const formatted = `$${abs.toLocaleString()}`;
    return num < 0 ? `-${formatted}` : formatted;
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
      <div className="flex flex-col items-center gap-3 py-12 px-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-400 text-center">{error}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: "Investor Score", value: stats.investor_score?.toLocaleString(), emoji: "🏆", color: "#f59e0b" },
    { label: "Accuracy", value: `${Math.round((stats.accuracy || 0) * 100)}%`, emoji: "🎯", color: "#6366f1" },
    { label: "Total P&L", value: formatMoney(stats.total_profit), emoji: stats.total_profit >= 0 ? "📈" : "📉", color: stats.total_profit >= 0 ? "#10b981" : "#ef4444" },
    { label: "Deals Evaluated", value: stats.total_rounds, emoji: "📊", color: "#06b6d4" },
    { label: "Biggest Win", value: formatMoney(stats.biggest_win), emoji: "🚀", color: "#22c55e" },
    { label: "Current Streak", value: stats.current_streak, emoji: "🔥", color: "#f97316" },
    { label: "Best Streak", value: stats.best_streak, emoji: "⚡", color: "#a855f7" },
    { label: "Level", value: stats.level, emoji: "⭐", color: "#eab308" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">Your Stats</h2>
        {stats.persona && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {stats.persona}
          </span>
        )}
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 p-4"
            style={{ background: '#12121f' }}
          >
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* XP bar */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-2"
        style={{ background: '#12121f' }}>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">XP</span>
          <span className="text-white font-bold">{stats.xp?.toLocaleString()} XP</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{
              width: `${Math.min(100, ((stats.xp || 0) % 200) / 2)}%`,
            }}
          />
        </div>
        <p className="text-white/30 text-xs">Level {stats.level} → Level {(stats.level || 1) + 1}</p>
      </div>

      {/* Risk profile */}
      {stats.risk_profile && (
        <div className="rounded-2xl border border-white/10 p-4 text-center"
          style={{ background: '#12121f' }}>
          <p className="text-white/40 text-xs uppercase tracking-wide">Risk Profile</p>
          <p className="text-white font-bold mt-1">{stats.risk_profile}</p>
        </div>
      )}
    </div>
  );
}
