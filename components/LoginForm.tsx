"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";

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
  const [remember, setRemember] = useState(false);
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
      try {
        if (remember) {
          const payload = JSON.stringify({ username, password });
          localStorage.setItem("hh_saved_credentials", payload);
        } else {
          localStorage.removeItem("hh_saved_credentials");
        }
      } catch (e) {}
    }
  };

  // 初始化：如果本地有保存的凭证则自动填充
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("hh_saved_credentials");
      if (saved) {
        const obj = JSON.parse(saved);
        if (obj?.username) setUsername(obj.username);
        if (obj?.password) setPassword(obj.password);
        setRemember(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <Input
          id="username"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          placeholder="请输入用户名"
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="请输入密码"
          autoComplete="current-password"
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <Label htmlFor="remember" className="cursor-pointer">
          记住密码
        </Label>
      </div>
      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
    </form>
  );
}
