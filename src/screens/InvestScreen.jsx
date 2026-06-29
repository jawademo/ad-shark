import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, AlertCircle, Loader2,
  Trophy, Percent, DollarSign, Play, Share2, Link2, Check, MessageCircle, Building2
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ResultScreen from "../components/ResultScreen";
import useGameStore from "../store/gameStore";
import useAuthStore from "../store/authStore";
import useOfficeStore from "../store/officeStore.js";
import { encodeChallenge } from "../services/api.ts";

const QUICK_PERCENTS = [10, 25, 50, 100];

export default function InvestScreen() {
  const {
    status, error, balance, currentProduct, sessionResult,
    products, rounds,
    startSession, makeDecision, resetGame, clearError,
  } = useGameStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { addEarnings, totalEarnings, getTier } = useOfficeStore();
  const [officeEarned, setOfficeEarned] = useState(0);

  const [amount, setAmount] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Start session on mount if idle
  useEffect(() => {
    if (status === "idle") {
      startSession("classic").catch((err) => {
        setLastError(err.message || "Failed to start game");
      });
    }
  }, [status, startSession]);

  // Track office earnings when session ends
  useEffect(() => {
    if (status === "ended" && sessionResult && officeEarned === 0) {
      const profit = Math.max(0, (sessionResult.final_balance || 10000) - 10000);
      if (profit > 0) {
        const newTotal = addEarnings(profit);
        setOfficeEarned(profit);
      }
    }
    if (status === "playing") {
      setOfficeEarned(0);
    }
  }, [status, sessionResult]);

  // Reset investment amount when product changes
  useEffect(() => {
    if (currentProduct && balance > 0) {
      setAmount(Math.floor(balance * 0.1));
    }
  }, [currentProduct, balance]);

  const pct = balance > 0 ? Math.round((amount / balance) * 100) : 0;
  const setQuick = (p) => setAmount(Math.floor((p / 100) * balance));
  const formatMoney = (n) => `$${(n || 0).toLocaleString()}`;

  const handleInvest = async () => {
    if (amount <= 0) return;
    setRoundInProgress(true);
    setLastError(null);
    try {
      await makeDecision("invest", amount);
    } catch (err) {
      setLastError(err.message || "Something went wrong");
    } finally {
      setRoundInProgress(false);
    }
  };

  const handlePass = async () => {
    setRoundInProgress(true);
    setLastError(null);
    try {
      await makeDecision("pass", 0);
    } catch (err) {
      setLastError(err.message || "Something went wrong");
    } finally {
      setRoundInProgress(false);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    startSession("classic").catch((err) => {
      setLastError(err.message || "Failed to start new game");
    });
  };

  // ── Reveal step between products ──────────────────────────────────

  if (status === "revealing") {
    return <ResultScreen />;
  }

  // ── Loading state ──────────────────────────────────────────────────

  if (status === "loading" && !currentProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-950">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-gray-400">Loading your products...</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────

  if (status === "idle" && lastError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gray-950">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-white text-xl font-bold">Couldn't start game</h2>
        <p className="text-gray-400 text-center max-w-xs">{lastError}</p>
        <button
          onClick={() => {
            setLastError(null);
            startSession("classic");
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Session ended ──────────────────────────────────────────────────

  if (status === "ended" && sessionResult) {
    const sr = sessionResult;
    const playerName = user?.display_name || user?.username || "Anonymous Shark";
    const challengeCode = encodeChallenge(
      products,
      rounds.map(r => ({ product_id: r.product_id, decision: r.decision, investment_amount: r.investment_amount })),
      sr.final_balance,
      playerName
    );
    const challengeUrl = `${window.location.origin}/challenge/${challengeCode}`;
    const shareText = `I turned $10k into ${formatMoney(sr.final_balance)} on ad-shark 🦈 Think you can do better? Beat my score:`;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-4 px-4 py-8 max-w-md mx-auto"
      >
        <div className="text-center">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white">Session Complete!</h2>
          <p className="text-gray-400">Great instincts, {playerName}.</p>
        </div>

        {/* Score card */}
        <div className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ background: '#12121f' }}>
          <div className="flex justify-between">
            <span className="text-gray-400">Final Balance</span>
            <span className="text-white font-bold">{formatMoney(sr.final_balance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Profit / Loss</span>
            <span className={`font-bold ${sr.final_balance >= 10000 ? 'text-green-400' : 'text-red-400'}`}>
              {sr.final_balance >= 10000 ? '+' : ''}{formatMoney(sr.final_balance - 10000)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rounds Played</span>
            <span className="text-white font-bold">{sr.rounds_played || 5}</span>
          </div>
        </div>

        {/* Challenge a Friend */}
        <div className="rounded-2xl border border-amber-500/20 p-4 space-y-3" style={{ background: '#1a1a0a' }}>
          <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Challenge a Friend
          </h3>
          <p className="text-gray-400 text-xs">Send them the same products. See who's the better shark.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(challengeUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2"
            >
              {copiedLink ? <><Check className="w-4 h-4" /> Copied!</> : <><Link2 className="w-4 h-4" /> Copy Link</>}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(challengeUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Share on X
            </a>
          </div>
        </div>

        {/* Office Progress */}
        {officeEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-indigo-500/20 p-4 space-y-2"
            style={{ background: '#0a0a1f' }}
          >
            <h3 className="text-indigo-400 font-bold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Office Earnings
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Profit added to office</span>
              <span className="text-emerald-400 font-bold">+{formatMoney(officeEarned)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total office balance</span>
              <span className="text-indigo-400 font-bold">{formatMoney(totalEarnings)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl">{getTier()?.emoji}</span>
              <span className="text-white text-xs">{getTier()?.name}</span>
            </div>
            <button
              onClick={() => navigate("/office")}
              className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold rounded-lg text-sm mt-1"
            >
              View Office →
            </button>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePlayAgain}
            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl"
          >
            Leaderboard
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Playing state ──────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      {/* Product card */}
      <ProductCard product={currentProduct} />

      {/* Error toast */}
      {lastError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/30 border border-red-700 rounded-xl p-3 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{lastError}</p>
          <button
            onClick={() => setLastError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Investment Panel */}
      <div className="rounded-2xl border border-white/10 p-5 space-y-4"
        style={{ background: '#12121f' }}>

        <div className="flex justify-between items-center">
          <span className="text-white/50 text-sm">Your balance</span>
          <span className="font-bold text-amber-400">{formatMoney(balance)}</span>
        </div>

        {/* Bet amount display */}
        <div className="text-center">
          <div className="text-4xl font-black text-white">{formatMoney(amount)}</div>
          <div className="text-white/40 text-sm mt-1">{pct}% of your balance</div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setAmount(Math.floor((val / 100) * balance));
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f59e0b ${pct}%, #ffffff20 ${pct}%)`,
            outline: 'none',
          }}
        />

        {/* Quick picks */}
        <div className="flex gap-2">
          {QUICK_PERCENTS.map((p) => (
            <button
              key={p}
              onClick={() => setQuick(p)}
              disabled={roundInProgress}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 ${
                pct === p
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {p === 100 ? 'ALL IN' : `${p}%`}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handlePass}
            disabled={roundInProgress}
            className="flex-1 py-3.5 rounded-xl font-bold text-white/60 border border-white/10 hover:bg-white/5 transition-all disabled:opacity-30"
          >
            {roundInProgress ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'PASS'
            )}
          </button>
          <button
            onClick={handleInvest}
            disabled={amount <= 0 || roundInProgress}
            className="flex-[2] py-3.5 rounded-xl font-black text-black text-lg transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            style={{
              background: amount > 0 && !roundInProgress
                ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                : '#666',
            }}
          >
            {roundInProgress ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                INVEST
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
