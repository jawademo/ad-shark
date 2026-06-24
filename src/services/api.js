"""
ad-shark frontend API client.
Handles authentication, token refresh, and all backend communication.
"""

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

let accessToken: string | null = localStorage.getItem("access_token");
let refreshToken: string | null = localStorage.getItem("refresh_token");

// ── Token management ─────────────────────────────────────────────────

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ── HTTP helpers ─────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  auth?: boolean;
}

async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth && accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  // Try token refresh on 401
  if (res.status === 401 && auth && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed && accessToken) {
      requestHeaders["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers: requestHeaders,
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new ApiError(res.status, error.detail || "Request failed", error);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

// ── Auth API ─────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      auth: false,
    }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      auth: false,
    }),

  me: () => request("/auth/me"),

  updateMe: (data: { display_name?: string; avatar_url?: string }) =>
    request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  logout: () => request("/auth/logout", { method: "POST" }),
};

// ── Game API ─────────────────────────────────────────────────────────

export const gameApi = {
  createSession: (mode: string) =>
    request("/game/sessions", {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),

  getSession: (sessionId: string) => request(`/game/sessions/${sessionId}`),

  playRound: (
    sessionId: string,
    data: {
      product_id: string;
      decision: string;
      investment_amount?: number;
      nonce: string;
    }
  ) =>
    request(`/game/sessions/${sessionId}/rounds`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRounds: (sessionId: string) =>
    request(`/game/sessions/${sessionId}/rounds`),

  endSession: (sessionId: string) =>
    request(`/game/sessions/${sessionId}/end`, { method: "POST" }),
};

// ── Challenge API ────────────────────────────────────────────────────

export const challengeApi = {
  getDaily: () => request("/challenges/daily"),

  startDaily: () =>
    request("/challenges/daily/start", { method: "POST" }),

  submitDaily: (challengeId: string, decisions: any[]) =>
    request(`/challenges/daily/${challengeId}/submit`, {
      method: "POST",
      body: JSON.stringify({ decisions }),
    }),

  dailyLeaderboard: (date: string) =>
    request(`/challenges/daily/${date}/leaderboard`, { auth: false }),

  dailyStreak: () => request("/challenges/daily/streak"),

  createFriendChallenge: (mode = "head_to_head") =>
    request("/challenges/friends", {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),

  previewFriendChallenge: (code: string) =>
    request(`/challenges/friends/${code}`, { auth: false }),

  acceptFriendChallenge: (code: string) =>
    request(`/challenges/friends/${code}/accept`, { method: "POST" }),
};

// ── Profile API ─────────────────────────────────────────────────────

export const profileApi = {
  getProfile: () => request("/profile"),

  getStats: () => request("/profile/stats"),

  getAchievements: () => request("/profile/achievements"),
};

// ── Leaderboard API ─────────────────────────────────────────────────

export const leaderboardApi = {
  get: (type = "all_time", key?: string) =>
    request(`/leaderboard?type=${type}${key ? `&key=${key}` : ""}`, {
      auth: false,
    }),
};

// ── Shop API ─────────────────────────────────────────────────────────

export const shopApi = {
  getBoosters: () => request("/shop/boosters"),

  buyBooster: (boosterId: string) =>
    request(`/shop/boosters/${boosterId}/buy`, { method: "POST" }),
};

// ── Social / Referrals API ───────────────────────────────────────────

export const socialApi = {
  getReferralCode: () => request("/social/referrals/code"),

  claimReferral: (code: string) =>
    request(`/social/referrals/claim/${code}`, { method: "POST" }),
};
