"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Pencil, Trash2, Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import RunningTime from "@/components/RunningTime";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Project as BaseProject } from "@/types/api";

interface ProjectWithItem extends BaseProject {
  item?: {
    market_name?: string;
    market_hash_name?: string;
    weapon?: string;
    exterior?: string;
    quality?: string;
    rarity?: string;
    icon_url?: string;
  };
}

export default function MonitoredItemsGrid() {
  const { token, user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectWithItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    projectId: number;
    action: "activate" | "deactivate";
    projectName: string;
  } | null>(null);
  const router = useRouter();

  // 编辑项目状态
  const [editingProject, setEditingProject] = useState<ProjectWithItem | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    name: "",
    crawl_interval: 5,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // 删除项目状态
  const [deletingProject, setDeletingProject] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 检查用户是否有权限操作项目（admin 或项目的 owner）
  const canControlProject = (project: ProjectWithItem) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "teacher" && project.owner_id === user.id) return true;
    return false;
  };

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res?.projects || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "加载项目失败";
      setError(errorMessage);
    }
  };

  const handleToggleStatus = async (
    projectId: number,
    action: "activate" | "deactivate"
  ) => {
    try {
      await api.updateProjectStatus(projectId, action);
      // 刷新项目列表
      await loadProjects();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "操作失败";
      alert(errorMessage);
    }
  };

  // 打开编辑对话框
  const handleEditClick = (project: ProjectWithItem, title: string) => {
    setEditingProject(project);
    setEditFormData({
      name: project.name || title,
      crawl_interval: project.crawl_interval || 5,
    });
    setEditError(null);
  };

  // 关闭编辑对话框
  const handleEditClose = () => {
    setEditingProject(null);
    setEditFormData({ name: "", crawl_interval: 5 });
    setEditError(null);
  };

  // 提交编辑
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await api.updateProject(editingProject.id, {
        name: editFormData.name,
        crawl_interval: editFormData.crawl_interval,
      });
      // 刷新项目列表
      await loadProjects();
      handleEditClose();
    } catch (err: any) {
      setEditError(err?.message || "更新项目失败");
    } finally {
      setEditLoading(false);
    }
  };

  // 打开删除确认对话框
  const handleDeleteClick = (project: ProjectWithItem, title: string) => {
    setDeletingProject({ id: project.id, name: title });
  };

  // 关闭删除确认对话框
  const handleDeleteCancel = () => {
    setDeletingProject(null);
  };

  // 确认删除
  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    setDeleteLoading(true);

    try {
      await api.deleteProject(deletingProject.id);
      // 刷新项目列表
      await loadProjects();
      setDeletingProject(null);
    } catch (err: any) {
      setError(err?.message || "删除项目失败");
      setDeletingProject(null);
    } finally {
      setDeleteLoading(false);
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
      .then((res) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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

              {/* 可点击区域 - 图片和标题 */}
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
                <div className="flex-1">
                  <div className="font-semibold">{title}</div>
                  <div className="text-xs text-gray-500">{subtitle}</div>
                </div>
              </div>

              {/* 可点击区域 - 信息和状态 */}
              <div
                className="mt-4 flex items-center justify-between cursor-pointer"
                onClick={handleClick}
              >
                <div className="text-sm text-gray-500">
                  <div>武器: {it.weapon || "-"}</div>
                  <div>稀有度: {it.rarity || "-"}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    爬取频率: 每{p.crawl_interval || 5}分钟
                  </div>
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
                  <div className="flex gap-2">
                    {/* 编辑按钮 - 1/3 宽度 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(p, title);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                      title="编辑项目"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">编辑</span>
                    </button>

                    {/* 删除按钮 - 1/3 宽度 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(p, title);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                      title="删除项目"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">删除</span>
                    </button>

                    {/* 暂停/启动按钮 - 1/3 宽度 */}
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
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Pause className="w-4 h-4" />
                        <span className="hidden sm:inline">暂停</span>
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
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">启动</span>
                      </button>
                    )}
                  </div>
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

      {/* 编辑项目对话框 */}
      <Dialog
        open={!!editingProject}
        onOpenChange={(open: boolean) => !open && handleEditClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
            <DialogDescription>修改项目名称和爬取频率</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">项目名称</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder="请输入项目名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>爬取频率（分钟）</Label>
                <div className="flex gap-2">
                  {[5, 15, 30, 60].map((interval) => (
                    <Button
                      key={interval}
                      type="button"
                      variant={
                        editFormData.crawl_interval === interval
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          crawl_interval: interval,
                        })
                      }
                      className="flex-1"
                    >
                      {interval}
                    </Button>
                  ))}
                </div>
              </div>

              {editError && (
                <div className="text-sm text-red-600">{editError}</div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleEditClose}
                disabled={editLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deletingProject}
        onOpenChange={(open: boolean) => !open && handleDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除项目？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除项目「{deletingProject?.name}
              」及其所有监控数据，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
