import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, Share2, Zap, Building2 } from "lucide-react";

export default function LandingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Hero */}
      <div className="px-6 pt-16 pb-12 text-center max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 inline-block">
            NEW — Can you spot the winners?
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black leading-tight mb-4"
        >
          Invest or Pass.<br />
          <span className="text-amber-400">You decide.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg mb-8"
        >
          Evaluate real and absurd product pitches. Build your reputation
          as the shark who can spot the next unicorn — or pour money into
          the next Juicero.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/play"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-lg transition-colors"
          >
            Play as Guest — Free
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-lg transition-colors"
          >
            Sign Up
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600 text-sm mt-4"
        >
          No download · Play in your browser · 2 minutes · Free
        </motion.p>
      </div>

      {/* Features */}
      <div className="px-6 pb-20 max-w-md mx-auto space-y-4">
        {[
          {
            icon: TrendingUp,
            title: "Evaluate Pitches",
            desc: "Read the pitch, check the signals, and decide: invest or pass. Every decision builds your track record.",
            color: "text-amber-400",
          },
          {
            icon: Zap,
            title: "Daily Challenge",
            desc: "Same 5 products, everyone worldwide, every day. Compare your instincts against the global leaderboard.",
            color: "text-blue-400",
          },
          {
            icon: Share2,
            title: "Challenge Friends",
            desc: "Send a challenge link. Same products, same conditions. See who has the sharper instincts.",
            color: "text-green-400",
          },
          {
            icon: Trophy,
            title: "Climb the Ranks",
            desc: "Earn XP, unlock achievements, discover your investor persona. From Minnow to Great White.",
            color: "text-purple-400",
          },
          {
            icon: Building2,
            title: "Build Your Empire",
            desc: "Use profits to upgrade your office — from coffee shop squatter to private island HQ. Flex on lesser sharks.",
            color: "text-indigo-400",
          },
        ].map(({ icon: Icon, title, desc, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <Icon className={`w-6 h-6 ${color} shrink-0 mt-0.5`} />
            <div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-gray-400 text-sm mt-0.5">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-gray-600 text-sm">
          ad-shark · Built for the instinct-driven
        </p>
      </div>
    </div>
  );
}
