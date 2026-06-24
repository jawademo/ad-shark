import { Outlet, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, TrendingUp, ShoppingBag, Calendar } from "lucide-react";

const NAV_ITEMS = [
  { path: "/play", icon: Play, label: "Play" },
  { path: "/daily", icon: Calendar, label: "Daily" },
  { path: "/stats", icon: TrendingUp, label: "Stats" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-gray-950/95 backdrop-blur-md z-50">
        <div className="max-w-md mx-auto flex justify-around py-2 px-4">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
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
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
