import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    const currentToken = sessionStorage.getItem("token");

    if (!currentToken) {
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      setToken(currentToken);
      return response.data;
    } catch (error) {
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    sessionStorage.setItem("token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    sessionStorage.setItem("token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // ignore logout API errors in UI
    } finally {
      clearSession();
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
      setUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
