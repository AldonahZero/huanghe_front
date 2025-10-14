"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import RunningTime from "@/components/RunningTime";

export default function MonitoredItemsGrid() {
  const { token, user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    projectId: number;
    action: "activate" | "deactivate";
    projectName: string;
  } | null>(null);
  const router = useRouter();

  // 检查用户是否有权限操作项目（admin 或项目的 owner）
  const canControlProject = (project: any) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "teacher" && project.owner_id === user.id) return true;
    return false;
  };

  const handleToggleStatus = async (
    projectId: number,
    action: "activate" | "deactivate"
  ) => {
    try {
      await api.updateProjectStatus(projectId, action);
      // 刷新项目列表
      const res = await api.getProjects();
      setProjects(res?.projects || []);
    } catch (err: any) {
      alert(err?.message || "操作失败");
    }
  };

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
    <>
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

          const showControlButton = canControlProject(p);

          return (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col dashboard-card transition-transform hover:scale-105 relative"
            >
              {/* 右上角运行时间 */}
              <div className="absolute top-2 right-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded shadow-sm border border-blue-100">
                <RunningTime createdAt={p.created_at} />
              </div>

              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={handleClick}
              >
                <img
                  src={img}
                  alt={title}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    // hide broken image
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="flex-1 pr-32">
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

              {showControlButton && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {p.is_active ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDialog({
                          projectId: p.id,
                          action: "deactivate",
                          projectName: title,
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Pause className="w-4 h-4" />
                      暂停监控
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDialog({
                          projectId: p.id,
                          action: "activate",
                          projectName: title,
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Play className="w-4 h-4" />
                      启动监控
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.action === "activate" ? "启动监控" : "暂停监控"}
          message={`确认要${
            confirmDialog.action === "activate" ? "启动" : "暂停"
          }项目「${confirmDialog.projectName}」的监控吗？`}
          confirmText={confirmDialog.action === "activate" ? "启动" : "暂停"}
          cancelText="取消"
          variant={confirmDialog.action === "activate" ? "success" : "default"}
          onConfirm={() =>
            handleToggleStatus(confirmDialog.projectId, confirmDialog.action)
          }
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  );
}
