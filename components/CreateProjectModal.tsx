"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { X } from "lucide-react";
import ItemSearchInput from "@/components/ItemSearchInput";

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
    template_id: null as number | null, // 选中的模板ID
    monitor_frequency: 60, // 默认60分钟
    member_level_required: [] as string[], // 可见等级（多选）
  });
  // 保存完整的选中候选（可能没有内部 template_id）
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id?: number;
    name?: string;
    market_hash_name?: string;
    icon_url?: string;
    [k: string]: any;
  } | null>(null);

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

    // 允许提交：如果没有 template_id，会把选中候选的基础信息发送给后端（后端负责映射/创建）
    if (!formData.template_id && !selectedTemplate) {
      setMessage({
        type: "error",
        text: "请从搜索结果中选择一个饰品",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 准备提交数据
      const payload: {
        name: string;
        template_id?: number | null;
        template_info?: any;
        member_level_required?: string;
        is_active?: boolean;
        monitor_frequency?: number;
      } = {
        name: formData.name,
        template_id: formData.template_id,
        member_level_required:
          formData.member_level_required.length > 0
            ? formData.member_level_required.join(",")
            : undefined,
        is_active: false, // 默认暂停状态
        monitor_frequency: formData.monitor_frequency,
      };

      // 如果没有 template_id，但用户选中了一个候选（外部 autocomplete），将把该候选信息带给后端，后端可尝试映射或创建模板
      if (!formData.template_id && selectedTemplate) {
        payload.template_info = {
          name: selectedTemplate.name || selectedTemplate.market_hash_name,
          market_hash_name: selectedTemplate.market_hash_name,
          icon_url: selectedTemplate.icon_url,
          // 其余字段全部传输，便于后端决策
          ...selectedTemplate,
        };
      }

      // 使用 API 客户端创建项目
      await api.createProject(payload);

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
            <ItemSearchInput
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              onSelectTemplate={(template) => {
                const displayName =
                  template.name || template.market_hash_name || `选择的饰品`;
                // 保存完整候选
                setSelectedTemplate(template || null);
                // 始终填充显示名称
                setFormData((prev) => ({ ...prev, name: displayName }));
                // 如果后端已映射出内部 id，则同时存储 id 以便直接提交
                if (template.id && template.id > 0) {
                  setFormData((prev) => ({
                    ...prev,
                    template_id: template.id ?? null,
                  }));
                } else {
                  // 清除 template_id 以表示当前未映射
                  setFormData((prev) => ({ ...prev, template_id: null }));
                }
                // 清除之前的错误提示
                setMessage(null);
              }}
              placeholder="输入饰品名称搜索..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              输入至少2个字符开始搜索,选择饰品后会自动填充
            </p>
            {selectedTemplate && selectedTemplate.id ? (
              <p className="text-xs text-green-600 mt-1">
                ✓ 已选择模板 ID: {selectedTemplate.id}
              </p>
            ) : selectedTemplate ? (
              <p className="text-xs text-yellow-600 mt-1">
                ✓ 已选择:{" "}
                {selectedTemplate.name || selectedTemplate.market_hash_name}
              </p>
            ) : null}
          </div>
          {/* 监控频率：选项卡 5 / 15 / 30 / 60 */}
          <div>
            <Label>监控频率（分钟）</Label>
            <div className="mt-2 flex gap-2">
              {[5, 15, 30, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, monitor_frequency: m }))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    formData.monitor_frequency === m
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">选择检查频率</p>
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
