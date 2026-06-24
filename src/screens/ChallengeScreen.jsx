import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Loader2, Play } from "lucide-react";
import { challengeApi } from "../services/api.js";
import useAuthStore from "../store/authStore.js";

export default function ChallengeScreen() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreview();
  }, [code]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await challengeApi.previewFriendChallenge(code);
      setPreview(data);
    } catch (err) {
      setError(err.message || "Challenge not found or expired");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/challenge/${code}`);
      return;
    }
    try {
      await challengeApi.acceptFriendChallenge(code);
      navigate("/play");
    } catch (err) {
      setError(err.message || "Failed to accept challenge");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gray-950">
        <Swords className="w-12 h-12 text-gray-600" />
        <h2 className="text-white text-xl font-bold">Challenge Not Found</h2>
        <p className="text-gray-400 text-center">{error || "This challenge link may have expired."}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
        >
          Go Home
        </button>
      </div>
    );
  }

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
            <span className="text-amber-400 font-medium">${preview.starting_balance?.toLocaleString()}</span>
          </div>
          {preview.challenger_score != null && (
            <div className="flex justify-between text-sm border-t border-white/5 pt-2">
              <span className="text-gray-400">Their Score</span>
              <span className="text-amber-400 font-bold">${preview.challenger_score?.toLocaleString()}</span>
            </div>
          )}
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
          No account needed to view. Sign up to play.
        </p>
      </motion.div>
    </div>
  );
}
