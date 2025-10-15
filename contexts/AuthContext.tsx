"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  user_nickname?: string;
  email?: string;
  role: string;
  member_type?: string;
  member_level?: string;
  avatar_url?: string;
  team_id?: number;
  team_name?: string;
  invited_by_user_id?: number;
  invited_by_username?: string;
  project_quota: number;
  created_at: string;
  updated_at: string;
};

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

  // 开发模式检测
  const isDevMode =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_DEV_MODE === "true";

  useEffect(() => {
    // 开发模式:使用模拟用户,跳过登录验证
    if (isDevMode) {
      const mockUser: User = {
        id: 1,
        username: "dev_user",
        user_nickname: "开发用户",
        email: "dev@example.com",
        role: "admin",
        member_type: "individual",
        member_level: "premium",
        avatar_url: "",
        project_quota: 999,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const mockToken = "dev-mock-token-12345";

      setToken(mockToken);
      setUser(mockUser);
      setPermissions(["admin"]);
      api.setAuthToken(mockToken);

      console.log("🔧 开发模式已启用 - 使用模拟用户登录");
      setLoading(false);
      return;
    }

    // 生产模式:从 localStorage 加载真实 token
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
  }, [isDevMode]);

  const login = async (values: { username: string; password: string }) => {
    const res = await api.login(values);
    if (!res?.token) throw new Error("无效的登录响应:缺少 token");
    setToken(res.token);
    api.setAuthToken(res.token);
    localStorage.setItem("hh_token", res.token);

    // 获取完整的用户信息
    try {
      const userProfile = await api.getUserProfile();
      setUser(userProfile);
      localStorage.setItem("hh_user", JSON.stringify(userProfile));

      // 设置权限
      const role = userProfile.role;
      const mapped = role === "admin" ? ["admin"] : [role];
      setPermissions(mapped);
      localStorage.setItem("hh_permissions", JSON.stringify(mapped));
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // 如果获取用户信息失败,使用登录响应中的基本信息
      if (res.user) {
        setUser(res.user as any);
        localStorage.setItem("hh_user", JSON.stringify(res.user));

        if ((res.user as any).role) {
          const role = (res.user as any).role as string;
          const mapped = role === "admin" ? ["admin"] : [role];
          setPermissions(mapped);
          localStorage.setItem("hh_permissions", JSON.stringify(mapped));
        }
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
