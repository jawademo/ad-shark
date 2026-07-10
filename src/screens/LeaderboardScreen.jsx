import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Loader2 } from "lucide-react";
import { leaderboardApi } from "../services/api.ts";
import { useI18n } from "../i18n/LanguageContext.jsx";

export default function LeaderboardScreen() {
  const { t } = useI18n();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all_time");

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leaderboardApi.get(type);
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch / tab change
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-1" />
        <h2 className="text-2xl font-black text-white">{t("lb.title")}</h2>
        <p className="text-gray-400 text-sm">{t("lb.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 rounded-xl p-1">
        {[
          { key: "all_time", label: t("lb.allTime") },
          { key: "weekly", label: t("lb.weekly") },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              type === key
                ? "bg-amber-500 text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("lb.empty")}</p>
        </div>
      )}

      {/* List */}
      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.user_id ?? entry.username ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5"
              style={{
                background: i < 3 ? 'rgba(245, 158, 11, 0.05)' : '#12121f',
              }}
            >
              {/* Rank */}
              <span className={`w-8 text-center font-black text-sm ${
                i === 0 ? 'text-amber-400 text-lg' :
                i === 1 ? 'text-gray-300' :
                i === 2 ? 'text-amber-700' :
                'text-gray-500'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>

              {/* Avatar placeholder */}
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-white/60 text-sm font-bold">
                  {(entry.display_name || entry.username || "?").charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {entry.display_name || entry.username}
                </p>
              </div>

              {/* Score */}
              <span className="text-amber-400 font-bold text-sm">
                {entry.score?.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
