import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Trophy, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { challengeApi } from "../services/api.js";

export default function DailyChallengeScreen() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await challengeApi.getDaily();
      setChallenge(data);
    } catch (err) {
      setError(err.message || "No challenge available");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (productId, decision) => {
    setDecisions((prev) => ({ ...prev, [productId]: decision }));
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    const allDecided = challenge.products.every((p) => decisions[p.id]);
    if (!allDecided) {
      setError("Decide on all products first");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const decisionsList = challenge.products.map((p) => ({
        product_id: p.id,
        decision: decisions[p.id],
        investment_amount: 10000,
        nonce: crypto.randomUUID(),
      }));
      const res = await challengeApi.submitDaily(challenge.id, decisionsList);
      setResult(res);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 bg-gray-950">
        <Calendar className="w-12 h-12 text-gray-600" />
        <p className="text-gray-400 text-center">{error}</p>
        <button
          onClick={loadChallenge}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <Calendar className="w-8 h-8 text-amber-400 mx-auto mb-1" />
        <h2 className="text-2xl font-black text-white">Daily Challenge</h2>
        <p className="text-gray-400 text-sm">
          {new Date(challenge.challenge_date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        {challenge.completed && !submitted && (
          <p className="text-green-400 text-sm mt-1">✓ You've completed this challenge</p>
        )}
      </div>

      {/* Results (if submitted) */}
      {submitted && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/10 p-5 space-y-3 text-center"
          style={{ background: '#12121f' }}
        >
          <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
          <div className="text-3xl font-black text-white">{result.correct_count}/{result.total_products}</div>
          <p className="text-gray-400">Correct decisions</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-gray-400">Score: <strong className="text-amber-400">{result.score?.toLocaleString()}</strong></span>
            {result.rank && result.total_players && (
              <span className="text-gray-400">Rank: <strong className="text-white">#{result.rank} of {result.total_players}</strong></span>
            )}
          </div>
          <p className="text-blue-400 text-sm">+{result.xp_earned} XP earned</p>
        </motion.div>
      )}

      {/* Products */}
      {!submitted && (
        <div className="space-y-3">
          {challenge.products.map((product, i) => (
            <div
              key={product.id}
              className="rounded-xl border border-white/10 p-4 space-y-2"
              style={{ background: '#12121f' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-gray-500">#{i + 1}</span>
                  <h3 className="font-bold text-white">{product.name}</h3>
                  <p className="text-amber-400 text-xs">{product.tagline}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{product.description}</p>

              {/* Decision buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleDecision(product.id, "invest")}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                    decisions[product.id] === "invest"
                      ? "bg-amber-500 text-black"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  INVEST
                </button>
                <button
                  onClick={() => handleDecision(product.id, "pass")}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                    decisions[product.id] === "pass"
                      ? "bg-red-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  PASS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={submitting || challenge.completed || challenge.products.some((p) => !decisions[p.id])}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Trophy className="w-5 h-5" />
              Submit Decisions
            </>
          )}
        </button>
      )}
    </div>
  );
}
