"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useRouter } from "next/navigation";

type User = any;

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (values: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // load token from localStorage
    const t = typeof window !== "undefined" ? localStorage.getItem("hh_token") : null;
    const u = typeof window !== "undefined" ? localStorage.getItem("hh_user") : null;
    if (t) {
      setToken(t);
      api.setAuthToken(t);
    }
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (values: { username: string; password: string }) => {
    const res = await api.login(values);
    if (!res?.token) throw new Error("无效的登录响应：缺少 token");
    setToken(res.token);
    api.setAuthToken(res.token);
    localStorage.setItem("hh_token", res.token);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem("hh_user", JSON.stringify(res.user));
    }
    // redirect to dashboard
    try {
      router.push("/dashboard");
    } catch (e) {
      // noop on server
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
    localStorage.removeItem("hh_token");
    localStorage.removeItem("hh_user");
    try {
      router.push("/login");
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
