"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function MonitoredItemsGrid() {
  const { token, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    if (authLoading) return;
    if (!token) {
      setError("未授权，请先登录");
      return;
    }

    setLoading(true);
    api
      .getProjects()
      .then((res: any) => {
        if (!mounted) return;
        setProjects(res?.projects || []);
      })
      .catch((err) => {
        setError(err?.message || "加载监控饰品失败");
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [authLoading, token]);

  if (authLoading) return <div>正在验证身份…</div>;
  if (loading) return <div>加载监控饰品中...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!projects || projects.length === 0)
    return <div className="text-sm text-gray-500">暂无监控饰品</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => {
        const it = p.item || {};
        const title =
          it.market_name ||
          it.market_hash_name ||
          it.market_name ||
          it.weapon ||
          p.name ||
          `项目 ${p.id}`;
        const subtitle = it.exterior || it.quality || "";
        const img = it.icon_url || "";

        const handleClick = () => {
          router.push(`/dashboard/project/${p.id}`);
        };

        return (
          <div
            key={p.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col dashboard-card cursor-pointer transition-transform hover:scale-105"
            onClick={handleClick}
          >
            <div className="flex items-center gap-4">
              <img
                src={img}
                alt={title}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  // hide broken image
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <div className="font-semibold">{title}</div>
                <div className="text-xs text-gray-500">{subtitle}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <div>武器: {it.weapon || "-"}</div>
                <div>稀有度: {it.rarity || "-"}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {p.is_active ? (
                  <Badge variant="success" className="gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    启动中
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <span>⏸️</span>
                    已暂停
                  </Badge>
                )}
                <div className="text-xs text-gray-400">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
