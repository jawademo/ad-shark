import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Play } from "lucide-react";
import { decodeChallenge } from "../services/api.ts";

export default function ChallengeScreen() {
  const { code } = useParams();
  const navigate = useNavigate();

  // Decode the challenge from the URL — pure derivation, no backend needed
  const { preview, error } = useMemo(() => {
    const decoded = decodeChallenge(code);
    if (decoded && decoded.p && decoded.p.length > 0) {
      return {
        preview: {
          challenger_name: decoded.n || "Anonymous Shark",
          challenger_score: decoded.s || 0,
          products: decoded.p,
          decisions: decoded.d || [],
          product_count: decoded.p.length,
          mode: "classic",
          starting_balance: 10000,
        },
        error: null,
      };
    }
    return { preview: null, error: "Invalid or expired challenge link" };
  }, [code]);

  const handleAccept = () => {
    // Store the challenge products in sessionStorage and navigate to play
    if (preview) {
      sessionStorage.setItem("challenge_products", JSON.stringify(preview.products));
      sessionStorage.setItem("challenge_challenger_name", preview.challenger_name);
      sessionStorage.setItem("challenge_challenger_score", String(preview.challenger_score));
    }
    navigate("/play?mode=challenge");
  };

  if (error || !preview) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gray-950">
        <Swords className="w-12 h-12 text-gray-600" />
        <h2 className="text-white text-xl font-bold">Challenge Not Found</h2>
        <p className="text-gray-400 text-center">{error || "This challenge link may have expired."}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-amber-500 text-black rounded-xl font-semibold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const challengerScore = preview.challenger_score || 0;
  const profit = challengerScore - 10000;
  const formatMoney = (n) => `$${(n || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <Swords className="w-16 h-16 text-amber-400 mx-auto" />

        <div>
          <h1 className="text-2xl font-black text-white">
            {preview.challenger_name} challenged you!
          </h1>
          <p className="text-gray-400 mt-1">
            Same products. Same conditions. Who has the sharper instincts?
          </p>
        </div>

        {/* Challenge details */}
        <div className="rounded-xl border border-white/10 p-4 space-y-2" style={{ background: '#12121f' }}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mode</span>
            <span className="text-white font-medium capitalize">{preview.mode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Products</span>
            <span className="text-white font-medium">{preview.product_count} pitches</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Starting Balance</span>
            <span className="text-amber-400 font-medium">{formatMoney(preview.starting_balance)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-white/5 pt-2">
            <span className="text-gray-400">Their Final Balance</span>
            <span className="text-amber-400 font-bold">{formatMoney(challengerScore)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Their Profit/Loss</span>
            <span className={`font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}{formatMoney(profit)}
            </span>
          </div>
        </div>

        {/* Preview of products they'll see */}
        <div className="text-left">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">You'll evaluate:</p>
          <div className="space-y-1.5">
            {preview.products.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                <span className="text-lg">{p.categoryEmoji || '📦'}</span>
                <span className="text-white font-medium">{p.name}</span>
                <span className="text-gray-500 text-xs ml-auto truncate">{p.tagline}</span>
              </div>
            ))}
            {preview.products.length > 3 && (
              <p className="text-gray-600 text-xs text-center pt-1">
                + {preview.products.length - 3} more...
              </p>
            )}
          </div>
        </div>

        {/* Accept button */}
        <button
          onClick={handleAccept}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl flex items-center justify-center gap-2 text-lg transition-colors"
        >
          <Play className="w-5 h-5" />
          Accept Challenge
        </button>

        <p className="text-gray-600 text-xs">
          No account needed · Play in your browser · 2 minutes
        </p>
      </motion.div>
    </div>
  );
}
