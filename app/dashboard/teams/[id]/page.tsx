"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
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
import { Upload, Copy, RefreshCw, X, Check, ArrowLeft } from "lucide-react";
import Select from "@/components/ui/select";

export default function TeamDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const teamId = parseInt(params.id as string);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 团队信息
  const [teamInfo, setTeamInfo] = useState<api.TeamInfo | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // 团队信息表单
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar_url: "",
  });

  // 头像上传相关
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 邀请码相关
  const [inviteCodes, setInviteCodes] = useState<api.InviteCodeInfo[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  // 生成邀请码表单
  const [showInviteForm, setShowInviteForm] = useState(false);
  // 团队成员（来自 getTeamInfo）
  const [teamMembers, setTeamMembers] = useState<api.TeamMember[]>([]);
  // 弹窗编辑成员等级状态
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<api.TeamMember | null>(
    null
  );
  const [selectedMemberLevel, setSelectedMemberLevel] =
    useState<string>("normal");
  const [updatingMember, setUpdatingMember] = useState(false);
  // 团队详情返回的 invites（优先使用）；若后端未返回则使用 inviteCodes
  const [teamInvites, setTeamInvites] = useState<api.TeamInvite[] | null>(null);

  // 检查权限
  const hasPermission = user?.role === "admin" || user?.role === "teacher";
  const isMemberOnly = !!user && !hasPermission;

  // 加载团队信息
  useEffect(() => {
    if (!user || !teamId) return;
    // 所有人（登录用户）都可加载团队基本信息
    loadTeamInfo();
    // 仅管理员/老师加载邀请码
    if (hasPermission) {
      loadInviteCodes();
    }
  }, [user, hasPermission, teamId]);

  // 如果 auth 加载完成但没有登录用户，重定向到登录页
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const loadTeamInfo = async () => {
    setLoadingTeam(true);
    try {
      const response = await api.getTeamInfo(teamId);
      setTeamInfo(response.team);
      // 如果返回 members/invites，一并保存
      if ((response as any).members) {
        setTeamMembers((response as any).members as api.TeamMember[]);
      }
      if ((response as any).invites) {
        setTeamInvites((response as any).invites as api.TeamInvite[]);
      }
      setFormData({
        name: response.team.name || "",
        description: response.team.description || "",
        avatar_url: response.team.avatar_url || "",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "加载团队信息失败",
      });
    } finally {
      setLoadingTeam(false);
    }
  };

  const loadInviteCodes = async () => {
    setLoadingCodes(true);
    try {
      const response = await api.getInviteCodes(teamId);
      setInviteCodes(response.invite_codes);
    } catch (error: any) {
      console.error("加载邀请码失败:", error);
    } finally {
      setLoadingCodes(false);
    }
  };

  // 处理头像文件选择
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({
        type: "error",
        text: "图片大小不能超过 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setFormData({ ...formData, avatar_url: reader.result as string });
      setMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 保存团队信息
  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const updateData: any = {};

      if (formData.name !== (teamInfo?.name || "")) {
        updateData.name = formData.name;
      }
      if (formData.description !== (teamInfo?.description || "")) {
        updateData.description = formData.description;
      }
      if (formData.avatar_url !== (teamInfo?.avatar_url || "")) {
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

      const response = await api.updateTeamInfo(teamId, updateData);

      setMessage({
        type: "success",
        text: response.message || "团队信息更新成功！",
      });
      setIsEditing(false);
      setAvatarPreview(null);
      setTeamInfo(response.team);

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

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    setAvatarPreview(null);
    if (teamInfo) {
      setFormData({
        name: teamInfo.name || "",
        description: teamInfo.description || "",
        avatar_url: teamInfo.avatar_url || "",
      });
    }
  };

  // 生成邀请码
  type InviteForm = {
    uses_allowed: number;
    expires_in_days: number;
    member_level: string;
  };

  const [inviteForm, setInviteForm] = useState<InviteForm>({
    uses_allowed: 10,
    expires_in_days: 30,
    member_level: "normal",
  });
  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    setMessage(null);

    try {
      const response = await api.generateInviteCode(teamId, {
        uses_allowed: inviteForm.uses_allowed,
        expires_in_days: inviteForm.expires_in_days,
        member_level: inviteForm.member_level,
      });

      setMessage({
        type: "success",
        text: "邀请码生成成功！",
      });
      setShowInviteForm(false);
      loadInviteCodes();

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "生成邀请码失败",
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  // 复制邀请码
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "复制失败，请手动复制",
      });
    }
  };

  // 权限检查
  if (authLoading || loadingTeam) {
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
          <div className="text-red-600 mb-4 text-xl">⚠️ 未登录</div>
          <p className="text-gray-600">请先登录后查看团队信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/dashboard/teams")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回团队列表
        </Button>

        <h1 className="text-3xl font-bold mb-6">
          {hasPermission ? "团队设置" : "团队信息（只读）"}
        </h1>

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

        {/* 团队身份牌 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>团队身份牌</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 团队身份牌展示区 */}
            <div className="relative bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 rounded-2xl p-8 shadow-lg">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
                disabled={!isEditing}
              />

              {/* 团队头像（大） */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative group">
                  <Avatar
                    className={`h-32 w-32 border-4 border-white shadow-xl ${
                      isEditing
                        ? "cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-indigo-500 transition-all"
                        : ""
                    }`}
                    onClick={handleAvatarClick}
                  >
                    <AvatarImage
                      src={avatarPreview || formData.avatar_url || "/logo.ico"}
                      alt={formData.name}
                    />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && hasPermission && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <Upload className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  {avatarPreview && isEditing && hasPermission && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAvatar();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg z-10"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {formData.name || "未命名团队"}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {formData.description || "暂无描述"}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-white/80 rounded-full text-gray-700 font-medium">
                      👥 {teamInfo?.member_count || 0} 成员
                    </span>
                    <span className="px-3 py-1 bg-white/80 rounded-full text-gray-700 font-medium">
                      📅{" "}
                      {teamInfo?.created_at
                        ? new Date(teamInfo.created_at).toLocaleDateString(
                            "zh-CN"
                          )
                        : "未知"}
                    </span>
                  </div>
                </div>

                {/* 用户头像（小） */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage src={user?.avatar_url} alt={user?.username} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white font-semibold">
                      {(user?.user_nickname || user?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 font-medium">
                    {user?.user_nickname || user?.username}
                  </span>
                </div>
              </div>

              {/* 创建者信息 */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-semibold">创建者:</span>
                  <span>
                    {teamInfo?.owner_nickname ||
                      teamInfo?.owner_name ||
                      `ID: ${teamInfo?.owner_id}`}
                  </span>
                </div>
              </div>

              {isEditing && hasPermission && (
                <div className="mt-4 text-xs text-gray-500 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <p className="font-medium mb-1">💡 提示：</p>
                  <p>• 点击大头像可以上传团队头像</p>
                  <p>• 支持 JPG、PNG、GIF、WebP 格式，大小不超过 5MB</p>
                </div>
              )}

              {avatarPreview && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <Check className="w-4 h-4" />
                  新头像已选择，保存后生效
                </div>
              )}
            </div>

            {/* 团队名称 */}
            <div className="space-y-2">
              <Label htmlFor="team_name">团队名称</Label>
              <Input
                id="team_name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing || !hasPermission}
                placeholder="输入团队名称"
              />
            </div>

            {/* 团队描述 */}
            <div className="space-y-2">
              <Label htmlFor="team_description">团队描述</Label>
              <textarea
                id="team_description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={!isEditing || !hasPermission}
                placeholder="输入团队描述"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* 团队信息（只读） */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>创建者昵称</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {teamInfo?.owner_nickname ||
                    teamInfo?.owner_name ||
                    `ID: ${teamInfo?.owner_id}`}
                </div>
              </div>

              <div className="space-y-2">
                <Label>成员数量</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {teamInfo?.member_count || 0} 人
                </div>
              </div>

              <div className="space-y-2">
                <Label>创建者</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {teamInfo?.owner_name || `ID: ${teamInfo?.owner_id}`}
                </div>
              </div>

              <div className="space-y-2">
                <Label>创建时间</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {teamInfo?.created_at
                    ? new Date(teamInfo.created_at).toLocaleDateString("zh-CN")
                    : "未知"}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              {hasPermission ? (
                !isEditing ? (
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
                )
              ) : (
                <div className="text-sm text-gray-500">
                  您无权编辑该团队信息
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 成员列表卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>团队成员</CardTitle>
            <CardDescription>
              {hasPermission
                ? "团队成员列表（点击可编辑等级）"
                : "团队成员列表（只读）"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center text-gray-500 py-6">暂无成员数据</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map((m) => (
                  <div
                    key={m.user_id}
                    className={`flex items-center gap-3 p-3 border rounded-lg bg-white ${
                      hasPermission
                        ? "cursor-pointer hover:shadow transition-shadow"
                        : ""
                    }`}
                    onClick={() => {
                      if (!hasPermission) return;
                      setSelectedMember(m);
                      setSelectedMemberLevel(m.member_level || "normal");
                      setShowMemberModal(true);
                    }}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {(m.user_nickname || m.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {m.user_nickname || m.username}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {m.role_in_team} • 加入于{" "}
                        {new Date(m.joined_at).toLocaleDateString("zh-CN")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {
                          (
                            {
                              emperor: "帝王",
                              private_director: "私董",
                              core: "核心",
                              normal: "普通",
                            } as Record<string, string>
                          )[m.member_level || "normal"]
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 邀请码管理卡片 */}
        {hasPermission && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>邀请码管理</CardTitle>
                  <CardDescription>生成和管理团队邀请码</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadInviteCodes}
                    variant="outline"
                    size="sm"
                    disabled={loadingCodes}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loadingCodes ? "animate-spin" : ""
                      }`}
                    />
                    刷新
                  </Button>
                  <Button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    size="sm"
                  >
                    生成邀请码
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 生成邀请码表单 */}
              {showInviteForm && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
                  <h3 className="font-medium">生成新邀请码</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uses_allowed">可使用次数</Label>
                      <Input
                        id="uses_allowed"
                        type="number"
                        min="1"
                        value={inviteForm.uses_allowed}
                        onChange={(e) =>
                          setInviteForm({
                            ...inviteForm,
                            uses_allowed: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expires_in_days">有效期（天）</Label>
                      <Input
                        id="expires_in_days"
                        type="number"
                        min="1"
                        value={inviteForm.expires_in_days}
                        onChange={(e) =>
                          setInviteForm({
                            ...inviteForm,
                            expires_in_days: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member_level">分配会员级别</Label>
                    <Select
                      id="member_level"
                      value={inviteForm.member_level}
                      onChange={(e) =>
                        setInviteForm({
                          ...inviteForm,
                          member_level: e.target.value,
                        })
                      }
                    >
                      <option value="emperor">emperor（最高级别）</option>
                      <option value="private_director">
                        private_director（私董 / 私人董事）
                      </option>
                      <option value="core">core（核心会员）</option>
                      <option value="normal">normal（普通会员）</option>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerateCode}
                      disabled={generatingCode}
                      size="sm"
                    >
                      {generatingCode ? "生成中..." : "确认生成"}
                    </Button>
                    <Button
                      onClick={() => setShowInviteForm(false)}
                      variant="outline"
                      size="sm"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}

              {/* 邀请码列表 */}
              {loadingCodes ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : (
                (() => {
                  // 统一渲染后端返回的 invites（优先），否则使用 inviteCodes
                  const unified = teamInvites
                    ? teamInvites.map((t) => ({
                        key: `${t.code}-${t.created_at}`,
                        code: t.code,
                        uses_allowed: t.uses_allowed,
                        uses_remaining: t.uses_remaining,
                        expires_at: t.expires_at,
                        created_at: t.created_at,
                        is_active: t.is_active,
                        member_level: (t as any).member_level,
                      }))
                    : inviteCodes.map((c) => ({
                        key: String(c.id),
                        code: c.code,
                        uses_allowed: c.uses_allowed,
                        uses_remaining: c.uses_remaining,
                        expires_at: c.expires_at,
                        created_at: c.created_at,
                        is_active: c.uses_remaining > 0,
                        member_level: (c as any).member_level,
                      }));

                  if (unified.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        暂无邀请码，点击"生成邀请码"创建
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {unified.map((code) => (
                        <div
                          key={code.key}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <code className="text-lg font-mono font-bold text-indigo-600">
                                {code.code}
                              </code>
                              <Button
                                onClick={() => handleCopyCode(code.code)}
                                variant="ghost"
                                size="sm"
                                className="h-8"
                              >
                                {copiedCode === code.code ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1 text-green-600" />
                                    <span className="text-green-600">
                                      已复制
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    复制
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                              <div>
                                剩余次数: {code.uses_remaining} /{" "}
                                {code.uses_allowed}
                              </div>
                              <div>
                                创建时间:{" "}
                                {new Date(code.created_at).toLocaleString(
                                  "zh-CN"
                                )}
                              </div>
                              {code.expires_at && (
                                <div>
                                  过期时间:{" "}
                                  {new Date(code.expires_at).toLocaleString(
                                    "zh-CN"
                                  )}
                                </div>
                              )}
                              {code.member_level && (
                                <div>分配级别: {code.member_level}</div>
                              )}
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              code.uses_remaining > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {code.uses_remaining > 0 ? "可用" : "已用完"}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 成员等级编辑弹窗 */}
      {showMemberModal && selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowMemberModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">编辑会员等级</h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarFallback className="text-2xl">
                  {(
                    selectedMember.user_nickname ||
                    selectedMember.username ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {selectedMember.user_nickname || selectedMember.username}
                </div>
                <div className="text-sm text-gray-500">
                  @{selectedMember.username}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">团队角色:</span>
                <span className="font-medium">
                  {selectedMember.role_in_team}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">加入时间:</span>
                <span className="font-medium">
                  {new Date(selectedMember.joined_at).toLocaleDateString(
                    "zh-CN"
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">当前等级:</span>
                <span className="font-medium">
                  {
                    (
                      {
                        emperor: "帝王",
                        private_director: "私董",
                        core: "核心",
                        normal: "普通",
                      } as Record<string, string>
                    )[selectedMember.member_level || "normal"]
                  }
                </span>
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="memberLevelSelect" className="block mb-2">
                选择新等级
              </Label>
              <Select
                id="memberLevelSelect"
                value={selectedMemberLevel}
                onChange={(e) => setSelectedMemberLevel(e.target.value)}
              >
                <option value="emperor">帝王</option>
                <option value="private_director">私董</option>
                <option value="core">核心</option>
                <option value="normal">普通</option>
                <option value="">无（取消等级）</option>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  setUpdatingMember(true);
                  setMessage(null);
                  try {
                    const levelToSend =
                      selectedMemberLevel === "" ? null : selectedMemberLevel;
                    const res = await api.updateTeamMemberLevel(
                      teamId,
                      selectedMember.user_id,
                      levelToSend
                    );
                    // 更新本地 state
                    setTeamMembers((prev) =>
                      prev.map((pm) =>
                        pm.user_id === selectedMember.user_id
                          ? { ...pm, member_level: res.member.member_level }
                          : pm
                      )
                    );
                    setMessage({
                      type: "success",
                      text: res.message || "更新成功",
                    });
                    setShowMemberModal(false);
                  } catch (error: any) {
                    setMessage({
                      type: "error",
                      text: error?.message || "更新失败",
                    });
                  } finally {
                    setUpdatingMember(false);
                  }
                }}
                className="flex-1"
                disabled={updatingMember}
              >
                {updatingMember ? "保存中..." : "保存"}
              </Button>
              <Button
                onClick={() => setShowMemberModal(false)}
                variant="outline"
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
