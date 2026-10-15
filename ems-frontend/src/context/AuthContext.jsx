import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { endpoint } from "../services/api";

const AuthContext = createContext(null);
const USER_KEY = "ems_user";

function readSavedUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        const currentUser = data.user || data.data?.user || null;
        setUser(currentUser);
        if (currentUser) sessionStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        else sessionStorage.removeItem(USER_KEY);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        sessionStorage.removeItem(USER_KEY);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });
    return () => { active = false; };
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post(endpoint.login, credentials);
      const nextUser = data.user || data.data?.user || data.account || null;
      if (!data.success && !nextUser)
        throw new Error(data.message || "Login failed");
      if (!nextUser)
        throw new Error(
          "Login succeeded but user details were not returned by the API. Check the login response contract.",
        );
      setUser(nextUser);
      sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post(endpoint.logout);
    } catch {
      /* Clear local session state even if the logout endpoint is unavailable. */
    }
    setUser(null);
    sessionStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({ user, loading, authReady, login, logout, setUser }),
    [user, loading, authReady],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
