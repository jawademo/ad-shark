import { Outlet, useLocation, Link } from "react-router-dom";
import { Play, TrendingUp, ShoppingBag, Calendar, Building2 } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

const NAV_ITEMS = [
  { path: "/play", icon: Play, labelKey: "nav.play" },
  { path: "/daily", icon: Calendar, labelKey: "nav.daily" },
  { path: "/office", icon: Building2, labelKey: "nav.office" },
  { path: "/stats", icon: TrendingUp, labelKey: "nav.stats" },
  { path: "/shop", icon: ShoppingBag, labelKey: "nav.shop" },
];

export default function AppLayout() {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top bar with language switch */}
      <div className="flex justify-end px-4 pt-3 max-w-md mx-auto w-full">
        <LanguageToggle />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-gray-950/95 backdrop-blur-md z-50">
        <div className="max-w-md mx-auto flex justify-around py-2 px-4">
          {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${
                  active ? "text-amber-400" : "text-white/40 hover:text-white/70"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{t(labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
