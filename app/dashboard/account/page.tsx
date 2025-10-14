"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import * as api from "@/lib/api";
import { Upload, X } from "lucide-react";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 基本信息表单
  const [formData, setFormData] = useState({
    user_nickname: "",
    email: "",
    avatar_url: "",
  });

  // 头像上传相关
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 密码修改表单
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 加载用户数据
  useEffect(() => {
    if (user) {
      setFormData({
        user_nickname: user.user_nickname || "",
        email: user.email || "",
        avatar_url: user.avatar_url || "",
      });
      // 清除头像预览
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [user]);

  // 处理头像文件选择
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件类型检查
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "只支持 JPG、PNG、GIF、WebP 格式的图片",
      });
      return;
    }

    // 文件大小检查（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({
        type: "error",
        text: "图片大小不能超过 5MB",
      });
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setAvatarFile(file);
      setMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // 点击头像上传
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  // 移除选中的头像
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 上传头像到服务器 (需要后端支持)
  const uploadAvatarToServer = async (file: File): Promise<string> => {
    // TODO: 实现实际的上传逻辑
    // 这里需要调用后端的文件上传接口
    // const formData = new FormData();
    // formData.append("avatar", file);
    // const response = await api.uploadAvatarFile(formData);
    // return response.url;

    // 临时方案: 返回本地预览URL (实际应用中需要上传到服务器)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // 保存基本信息
  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const updateData: any = {};

      // 如果有新上传的头像,先上传
      if (avatarFile) {
        setIsUploadingAvatar(true);
        try {
          const avatarUrl = await uploadAvatarToServer(avatarFile);
          updateData.avatar_url = avatarUrl;
          setFormData({ ...formData, avatar_url: avatarUrl });
        } catch (error: any) {
          setMessage({
            type: "error",
            text: "头像上传失败: " + (error?.message || "未知错误"),
          });
          setIsSaving(false);
          setIsUploadingAvatar(false);
          return;
        }
        setIsUploadingAvatar(false);
      }

      // 只提交修改过的字段
      if (formData.user_nickname !== (user?.user_nickname || "")) {
        updateData.user_nickname = formData.user_nickname;
      }
      if (formData.email !== (user?.email || "")) {
        updateData.email = formData.email;
      }
      if (formData.avatar_url !== (user?.avatar_url || "") && !avatarFile) {
        updateData.avatar_url = formData.avatar_url;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({
          type: "error",
          text: "没有任何修改",
        });
        setIsSaving(false);
        return;
      }

      const response = await api.updateUserProfile(updateData);

      setMessage({
        type: "success",
        text: response.message || "个人信息更新成功！",
      });
      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);

      // 更新本地存储
      localStorage.setItem("hh_user", JSON.stringify(response.profile));

      // 3秒后清除消息
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "更新失败，请稍后重试",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    setMessage(null);

    // 验证密码
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "请填写所有密码字段",
      });
      setIsChangingPassword(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({
        type: "error",
        text: "两次输入的新密码不一致",
      });
      setIsChangingPassword(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "新密码长度不能少于 6 位",
      });
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await api.updatePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword
      );

      setMessage({
        type: "success",
        text: response.message || "密码修改成功！",
      });

      // 清空密码表单
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);

      // 3秒后清除消息
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "密码修改失败，请检查旧密码是否正确",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    setAvatarPreview(null);
    setAvatarFile(null);
    // 恢复原始数据
    if (user) {
      setFormData({
        user_nickname: user.user_nickname || "",
        email: user.email || "",
        avatar_url: user.avatar_url || "",
      });
    }
  };

  // 取消修改密码
  const handleCancelPassword = () => {
    setShowPasswordForm(false);
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMessage(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">请先登录</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">个人信息</h1>

        {message && (
          <Alert
            className={`mb-6 ${
              message.type === "error"
                ? "border-red-500 text-red-600"
                : "border-green-500 text-green-600"
            }`}
          >
            {message.text}
          </Alert>
        )}

        {/* 头像和基本信息卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>管理你的个人资料</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 头像上传 */}
            <div className="flex items-start gap-6 pb-6 border-b">
              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
                disabled={!isEditing}
              />

              {/* 头像预览区域 */}
              <div className="relative group">
                <Avatar
                  className={`h-24 w-24 ${
                    isEditing
                      ? "cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-indigo-500 transition-all"
                      : ""
                  }`}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage
                    src={avatarPreview || formData.avatar_url || "/logo.ico"}
                    alt={formData.user_nickname || user.username}
                  />
                  <AvatarFallback className="text-2xl">
                    {(formData.user_nickname || user.username)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* 编辑模式下显示上传图标覆盖层 */}
                {isEditing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                {/* 如果有新选择的图片,显示删除按钮 */}
                {avatarPreview && isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 头像上传说明 */}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  个人头像
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  点击头像或下方按钮上传新头像
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={!isEditing || isUploadingAvatar}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {avatarPreview ? "更换头像" : "上传头像"}
                  </Button>

                  {avatarFile && (
                    <span className="text-sm text-gray-600">
                      {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)}{" "}
                      KB)
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>• 支持 JPG、PNG、GIF、WebP 格式</p>
                  <p>• 文件大小不超过 5MB</p>
                  <p>• 建议使用正方形图片,以获得最佳显示效果</p>
                </div>

                {avatarPreview && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    新头像已选择,保存后生效
                  </div>
                )}
              </div>
            </div>

            {/* 用户名（只读） */}
            <div className="space-y-2">
              <Label>用户名（登录用）</Label>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                {user.username}
              </div>
              <p className="text-xs text-gray-500">用户名不可修改</p>
            </div>

            {/* 昵称 */}
            <div className="space-y-2">
              <Label htmlFor="user_nickname">昵称（网站显示）</Label>
              <Input
                id="user_nickname"
                value={formData.user_nickname}
                onChange={(e) =>
                  setFormData({ ...formData, user_nickname: e.target.value })
                }
                disabled={!isEditing}
                placeholder="输入昵称"
              />
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
                placeholder="your@email.com"
              />
            </div>

            {/* 角色信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>角色</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {user.role === "admin" && "管理员"}
                  {user.role === "teacher" && "老师"}
                  {user.role === "leader" && "团队长"}
                  {user.role === "member" && "成员"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>会员等级</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {user.member_level === "emperor" && "帝王"}
                  {user.member_level === "private_director" && "私董"}
                  {user.member_level === "core" && "核心"}
                  {user.member_level === "normal" && "普通"}
                  {!user.member_level && "无"}
                </div>
              </div>
            </div>

            {/* 团队信息 */}
            {user.team_name && (
              <div className="space-y-2">
                <Label>所属团队</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {user.team_name}
                </div>
              </div>
            )}

            {/* 项目配额 */}
            <div className="space-y-2">
              <Label>项目配额</Label>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                {user.role === "admin" ? "无限制" : user.project_quota}
              </div>
            </div>

            {/* 注册时间 */}
            <div className="space-y-2">
              <Label>注册时间</Label>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                {new Date(user.created_at).toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>编辑信息</Button>
              ) : (
                <>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "保存中..." : "保存更改"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                  >
                    取消
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 修改密码卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>定期更新密码以保护账户安全</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
              >
                修改密码
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">当前密码</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    placeholder="输入当前密码"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="输入新密码（至少6位）"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="再次输入新密码"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "修改中..." : "确认修改"}
                  </Button>
                  <Button
                    onClick={handleCancelPassword}
                    variant="outline"
                    disabled={isChangingPassword}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
