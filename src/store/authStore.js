import { create } from "zustand";
import {
  authApi,
  setTokens,
  clearTokens,
  getAccessToken,
} from "../services/api.js";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true on init to check stored token

  // Initialize from stored token
  init: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const data = await authApi.login({ email, password });
    setTokens(data.access_token, data.refresh_token);
    set({ user: data.user, isAuthenticated: true });
    return data.user;
  },

  register: async (username, email, password) => {
    const data = await authApi.register({ username, email, password });
    setTokens(data.access_token, data.refresh_token);
    set({ user: data.user, isAuthenticated: true });
    return data.user;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },
}));

export default useAuthStore;
