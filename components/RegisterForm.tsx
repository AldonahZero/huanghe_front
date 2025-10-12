"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import Alert from "./ui/alert";

interface Props {
  onRegister?: (values: {
    username: string;
    password: string;
    invite_code?: string;
  }) => Promise<void> | void;
}

export default function RegisterForm({ onRegister }: Props) {
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(
    null
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("用户名和密码不能为空");
      return;
    }
    setLoading(true);
    try {
      if (onRegister)
        await onRegister({ username, password, invite_code: inviteCode });
      else {
        if (auth)
          await auth.register({ username, password, invite_code: inviteCode });
        else await new Promise((res) => setTimeout(res, 800));
      }
    } catch (err) {
      // lib/api.request throws { message, status, payload }
      const e = err as
        | { message?: string; payload?: any; status?: number }
        | undefined;
      setFieldErrors(null);
      if (e?.payload && typeof e.payload === "object") {
        // attempt to extract field errors (common shape: { errors: { field: "msg" } } or { field: "msg" })
        const p = e.payload;
        if (p.errors && typeof p.errors === "object") {
          const fe: Record<string, string> = {};
          for (const k of Object.keys(p.errors)) {
            const v = p.errors[k];
            fe[k] = Array.isArray(v) ? String(v[0]) : String(v);
          }
          setFieldErrors(fe);
        } else {
          // sometimes the API returns field-specific messages directly
          const fe: Record<string, string> = {};
          for (const k of Object.keys(p)) {
            const v = p[k];
            if (typeof v === "string") fe[k] = v;
          }
          if (Object.keys(fe).length) setFieldErrors(fe);
        }
      }
      // if server returned 500, show friendly message
      if (e?.status === 500) setError("服务器错误，请稍后重试");
      else setError(e?.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

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
        {fieldErrors?.username && (
          <div className="text-sm text-red-600 mt-1">
            {fieldErrors.username}
          </div>
        )}
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
          autoComplete="new-password"
        />
        {fieldErrors?.password && (
          <div className="text-sm text-red-600 mt-1">
            {fieldErrors.password}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite_code">邀请码（可选）</Label>
        <Input
          id="invite_code"
          value={inviteCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInviteCode(e.target.value)
          }
          placeholder="团队码"
        />
        {fieldErrors?.invite_code && (
          <div className="text-sm text-red-600 mt-1">
            {fieldErrors.invite_code}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2">
          <Alert
            variant={
              error === "服务器错误，请稍后重试" ? "destructive" : "default"
            }
          >
            {error}
          </Alert>
        </div>
      )}
      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "注册中..." : "注册"}
      </Button>
    </form>
  );
}
