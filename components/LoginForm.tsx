"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onLogin?: (values: {
    username: string;
    password: string;
  }) => Promise<void> | void;
}

export default function LoginForm({ onLogin }: Props) {
  // useAuth can be used here because this is a client component and AuthProvider is mounted at root
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("用户名和密码不能为空");
      return;
    }
    setLoading(true);
    try {
      // stub: 调用外部 onLogin 或简单延迟模拟请求
      if (onLogin) await onLogin({ username, password });
      else {
        if (auth) await auth.login({ username, password });
        else await new Promise((res) => setTimeout(res, 800));
      }
    } catch (err) {
      const e = err as { message?: string } | undefined;
      setError(e?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          用户名
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="请输入用户名"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="请输入密码"
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </div>
    </form>
  );
}
