"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type {
  Project as TProject,
  ProjectsList as TProjectsList,
} from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectsList() {
  const { token, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<TProject[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    // wait until auth provider finished initializing
    if (authLoading) return;

    // if no token, don't call protected endpoints
    if (!token) {
      setError("未授权，请先登录");
      return;
    }

    setLoading(true);
    api
      .getProjects()
      .then((res: TProjectsList) => {
        if (!mounted) return;
        setProjects(res?.projects || []);
      })
      .catch((err) => {
        setError(err?.message || "加载项目失败");
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [authLoading, token]);

  if (authLoading) return <div>正在验证身份…</div>;
  if (loading) return <div>加载项目中...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!projects || projects.length === 0)
    return <div className="text-sm text-gray-500">暂无项目</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <div key={p.id} className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">{p.name || `项目 ${p.id}`}</h3>
          <div className="text-sm text-gray-500">模板：{p.template_id}</div>
        </div>
      ))}
    </div>
  );
}
