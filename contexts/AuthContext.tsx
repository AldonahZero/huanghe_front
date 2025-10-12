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
  register: (values: {
    username: string;
    password: string;
    invite_code?: string;
  }) => Promise<void>;
  permissions: string[];
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // load token from localStorage
    const t =
      typeof window !== "undefined" ? localStorage.getItem("hh_token") : null;
    const u =
      typeof window !== "undefined" ? localStorage.getItem("hh_user") : null;
    const p =
      typeof window !== "undefined"
        ? localStorage.getItem("hh_permissions")
        : null;
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
    if (p) {
      try {
        setPermissions(JSON.parse(p));
      } catch (e) {
        setPermissions([]);
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
      // persist permissions if provided
      if (
        (res.user as any).permissions &&
        Array.isArray((res.user as any).permissions)
      ) {
        setPermissions((res.user as any).permissions);
        localStorage.setItem(
          "hh_permissions",
          JSON.stringify((res.user as any).permissions)
        );
      } else if ((res.user as any).role) {
        const role = (res.user as any).role as string;
        const mapped = role === "admin" ? ["admin"] : [role];
        setPermissions(mapped);
        localStorage.setItem("hh_permissions", JSON.stringify(mapped));
      }
    }
    // redirect to dashboard
    try {
      router.push("/dashboard");
    } catch (e) {
      // noop on server
    }
  };

  const register = async (values: {
    username: string;
    password: string;
    invite_code?: string;
  }) => {
    const res = await api.register(values);
    // API may return token + user similar to login
    if (res && typeof res === "object" && (res as any).token) {
      const token = (res as any).token as string;
      setToken(token);
      api.setAuthToken(token);
      localStorage.setItem("hh_token", token);
      if ((res as any).user) {
        setUser((res as any).user);
        localStorage.setItem("hh_user", JSON.stringify((res as any).user));
        if (
          ((res as any).user as any).permissions &&
          Array.isArray(((res as any).user as any).permissions)
        ) {
          setPermissions(((res as any).user as any).permissions);
          localStorage.setItem(
            "hh_permissions",
            JSON.stringify(((res as any).user as any).permissions)
          );
        } else if (((res as any).user as any).role) {
          const role = ((res as any).user as any).role as string;
          const mapped = role === "admin" ? ["admin"] : [role];
          setPermissions(mapped);
          localStorage.setItem("hh_permissions", JSON.stringify(mapped));
        }
      }
      try {
        router.push("/dashboard");
      } catch (e) {}
      return;
    }
    // If no token, just return; caller may handle success differently
    return;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    api.setAuthToken(null);
    localStorage.removeItem("hh_token");
    localStorage.removeItem("hh_user");
    localStorage.removeItem("hh_permissions");
    try {
      router.push("/login");
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, permissions, logout }}
    >
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
