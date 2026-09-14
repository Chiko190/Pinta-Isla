import { createContext, useContext, useEffect, useState, useCallback } from "react";
import client, { setSessionExpiredHandler } from "../api/client";

const AuthContext = createContext(null);

const ROLE_HOME = {
  customer: "/customer/dashboard",
  artist: "/artist/dashboard",
  admin: "/admin/dashboard",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("pinta_token");
    setUser(null);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setSessionMessage("Your session has expired. Please log in again.");
      logout();
    });
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("pinta_token");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("pinta_token"))
      .finally(() => setLoading(false));
  }, []);

  function loginWithToken(token, userData) {
    localStorage.setItem("pinta_token", token);
    setUser(userData);
    setSessionMessage(null);
  }

  const value = {
    user,
    loading,
    loginWithToken,
    logout,
    sessionMessage,
    clearSessionMessage: () => setSessionMessage(null),
    homeFor: (role) => ROLE_HOME[role] || "/",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
