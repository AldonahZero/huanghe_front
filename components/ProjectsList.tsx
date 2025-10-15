"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type {
  Project as TProject,
  ProjectsList as TProjectsList,
} from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
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

export default function ProjectsList() {
  const { token, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<TProject[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 编辑项目状态
  const [editingProject, setEditingProject] = useState<TProject | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    crawl_interval: 5,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // 删除项目状态
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 加载项目列表
  const loadProjects = () => {
    if (authLoading || !token) return;

    setLoading(true);
    api
      .getProjects()
      .then((res: TProjectsList) => {
        setProjects(res?.projects || []);
      })
      .catch((err) => {
        setError(err?.message || "加载项目失败");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let mounted = true;
    // wait until auth provider finished initializing
    if (authLoading) return;

    // if no token, don't call protected endpoints
    if (!token) {
      setError("未授权，请先登录");
      return;
    }

    loadProjects();
    return () => {
      mounted = false;
    };
  }, [authLoading, token]);

  // 打开编辑对话框
  const handleEditClick = (project: TProject) => {
    setEditingProject(project);
    setEditFormData({
      name: project.name || "",
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
      loadProjects();
      handleEditClose();
    } catch (err: any) {
      setEditError(err?.message || "更新项目失败");
    } finally {
      setEditLoading(false);
    }
  };

  // 打开删除确认对话框
  const handleDeleteClick = (projectId: number) => {
    setDeletingProjectId(projectId);
  };

  // 关闭删除确认对话框
  const handleDeleteCancel = () => {
    setDeletingProjectId(null);
  };

  // 确认删除
  const handleDeleteConfirm = async () => {
    if (!deletingProjectId) return;

    setDeleteLoading(true);

    try {
      await api.deleteProject(deletingProjectId);
      // 刷新项目列表
      loadProjects();
      setDeletingProjectId(null);
    } catch (err: any) {
      setError(err?.message || "删除项目失败");
      setDeletingProjectId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading) return <div>正在验证身份…</div>;
  if (loading) return <div>加载项目中...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!projects || projects.length === 0)
    return <div className="text-sm text-gray-500">暂无项目</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-white rounded shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg flex-1">
                {p.name || `项目 ${p.id}`}
              </h3>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditClick(p)}
                  className="h-8 w-8 p-0"
                  title="编辑项目"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(p.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="删除项目"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              模板ID：{p.template_id || "无"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              爬取频率：每{p.crawl_interval || 5}分钟
            </div>
            <div className="text-xs text-gray-400 mt-1">
              创建时间：
              {p.created_at
                ? new Date(p.created_at).toLocaleDateString()
                : "未知"}
            </div>
          </div>
        ))}
      </div>

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
        open={!!deletingProjectId}
        onOpenChange={(open: boolean) => !open && handleDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除项目？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该项目及其所有监控数据，此操作无法撤销。
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
