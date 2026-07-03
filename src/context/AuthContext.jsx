import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setUnauthorizedHandler } from "../services/api.service.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "access_token";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const user = useMemo(() => accessToken ? decodeToken(accessToken) : null, [accessToken]);

  function login(token) {
    localStorage.setItem(TOKEN_KEY, token);
    setAccessToken(token);
  }

  function logout({ redirect = false } = {}) {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
    if (redirect && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  useEffect(() => {
    setUnauthorizedHandler(() => logout({ redirect: true }));
  }, []);

  const value = useMemo(() => ({
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken),
    login,
    logout
  }), [accessToken, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
