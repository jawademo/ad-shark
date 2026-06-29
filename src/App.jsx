import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/authStore.js";
import InvestScreen from "./screens/InvestScreen.jsx";
import StatsScreen from "./screens/StatsScreen.jsx";
import ShopScreen from "./screens/ShopScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import LandingScreen from "./screens/LandingScreen.jsx";
import DailyChallengeScreen from "./screens/DailyChallengeScreen.jsx";
import LeaderboardScreen from "./screens/LeaderboardScreen.jsx";
import ChallengeScreen from "./screens/ChallengeScreen.jsx";
import OfficeScreen from "./screens/OfficeScreen.jsx";
import AppLayout from "./components/AppLayout.jsx";
import "./App.css";

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-pulse text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/play" replace />;
  }

  return children;
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingScreen />} />

        {/* Auth */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterScreen />
            </PublicRoute>
          }
        />

        {/* Game — wrapped in AppLayout with bottom nav (guests welcome) */}
        <Route
          element={<AppLayout />}
        >
          <Route path="/play" element={<InvestScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/shop" element={<ShopScreen />} />
          <Route path="/daily" element={<DailyChallengeScreen />} />
          <Route path="/office" element={<OfficeScreen />} />
        </Route>
        <Route
          path="/leaderboard"
          element={<LeaderboardScreen />}
        />
        <Route
          path="/challenge/:code"
          element={<ChallengeScreen />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
