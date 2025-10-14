"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { X } from "lucide-react";

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    monitor_frequency: 60, // 默认60分钟
    member_level_required: [] as string[], // 可见等级（多选）
  });

  // 会员等级选项
  const memberLevels = [
    { value: "emperor", label: "帝王" },
    { value: "private_director", label: "私董" },
    { value: "core", label: "核心" },
    { value: "normal", label: "普通" },
  ];

  const handleLevelToggle = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      member_level_required: prev.member_level_required.includes(level)
        ? prev.member_level_required.filter((l) => l !== level)
        : [...prev.member_level_required, level],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 准备提交数据
      // 注意：template_id 需要根据饰品名称查询或创建，这里暂时使用 1 作为默认值
      // 实际应用中应该先搜索饰品，然后使用对应的 template_id
      const payload = {
        name: formData.name,
        template_id: 1, // TODO: 根据饰品名称获取或创建 template
        member_level_required:
          formData.member_level_required.length > 0
            ? formData.member_level_required.join(",")
            : undefined,
        is_active: false, // 默认暂停状态
        monitor_frequency: formData.monitor_frequency,
      };

      // 使用 API 客户端创建项目
      const result = await api.createProject(payload);

      setMessage({
        type: "success",
        text: "监控项目创建成功！默认为暂停状态",
      });

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "创建失败，请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">新建监控项目</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <Alert
            className={`mb-4 ${
              message.type === "error"
                ? "border-red-500 text-red-600"
                : "border-green-500 text-green-600"
            }`}
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 饰品名称 */}
          <div>
            <Label htmlFor="projectName">饰品名称</Label>
            <Input
              id="projectName"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="输入饰品名称"
              required
            />
          </div>

          {/* 监控频率 */}
          <div>
            <Label htmlFor="frequency">监控频率（分钟）</Label>
            <Input
              id="frequency"
              type="number"
              min="1"
              value={formData.monitor_frequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monitor_frequency: parseInt(e.target.value) || 60,
                })
              }
              placeholder="60"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              每隔多少分钟检查一次价格
            </p>
          </div>

          {/* 会员可见等级（多选） */}
          <div>
            <Label>会员可见等级</Label>
            <div className="mt-2 space-y-2">
              {memberLevels.map((level) => (
                <label
                  key={level.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.member_level_required.includes(
                      level.value
                    )}
                    onChange={() => handleLevelToggle(level.value)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{level.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">留空表示所有会员可见</p>
          </div>

          {/* 提示信息 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              💡 新建的监控项目默认为<strong>暂停状态</strong>
              ，需要手动启动才会开始监控
            </p>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "创建中..." : "创建"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
