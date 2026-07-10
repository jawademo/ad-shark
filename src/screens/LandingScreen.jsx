import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, Share2, Zap, Building2 } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";

export default function LandingScreen() {
  const { t } = useI18n();

  const steps = [
    { emoji: "📥", title: t("landing.step1Title"), desc: t("landing.step1Desc") },
    { emoji: "🤔", title: t("landing.step2Title"), desc: t("landing.step2Desc") },
    { emoji: "📊", title: t("landing.step3Title"), desc: t("landing.step3Desc") },
  ];

  const features = [
    { icon: TrendingUp, title: t("landing.feat1Title"), desc: t("landing.feat1Desc"), color: "text-amber-400" },
    { icon: Zap, title: t("landing.feat2Title"), desc: t("landing.feat2Desc"), color: "text-blue-400" },
    { icon: Share2, title: t("landing.feat3Title"), desc: t("landing.feat3Desc"), color: "text-green-400" },
    { icon: Trophy, title: t("landing.feat4Title"), desc: t("landing.feat4Desc"), color: "text-purple-400" },
    { icon: Building2, title: t("landing.feat5Title"), desc: t("landing.feat5Desc"), color: "text-indigo-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Language switch */}
      <div className="flex justify-end px-6 pt-4">
        <LanguageToggle />
      </div>

      {/* Hero */}
      <div className="px-6 pt-8 pb-10 text-center max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 inline-block">
            {t("landing.badge")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black leading-tight mb-4"
        >
          {t("landing.h1a")}<br />
          <span className="text-amber-400">{t("landing.h1b")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg mb-8"
        >
          {t("landing.subtitle")}
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
            {t("landing.playGuest")}
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-lg transition-colors"
          >
            {t("landing.signup")}
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600 text-sm mt-4"
        >
          {t("landing.noDownload")}
        </motion.p>
      </div>

      {/* How it works — the quick, visible explainer */}
      <div className="px-6 pb-4 max-w-md mx-auto">
        <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
          {t("landing.howTitle")}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map(({ emoji, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.1 }}
              className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4 text-center"
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <h3 className="font-bold text-white text-sm">{title}</h3>
              <p className="text-gray-400 text-xs mt-1 leading-snug">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pt-6 pb-20 max-w-md mx-auto space-y-4">
        {features.map(({ icon: Icon, title, desc, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
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
        <p className="text-gray-600 text-sm">{t("landing.footer")}</p>
      </div>
    </div>
  );
}
