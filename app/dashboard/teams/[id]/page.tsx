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
  // 编辑成员等级状态
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingMemberLevel, setEditingMemberLevel] =
    useState<string>("normal");
  const [updatingMember, setUpdatingMember] = useState(false);
  // 团队详情返回的 invites（优先使用）；若后端未返回则使用 inviteCodes
  const [teamInvites, setTeamInvites] = useState<api.TeamInvite[] | null>(null);

  // 检查权限
  const hasPermission = user?.role === "admin" || user?.role === "teacher";

  // 加载团队信息
  useEffect(() => {
    if (user && hasPermission && teamId) {
      loadTeamInfo();
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

  if (!user || !hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4 text-xl">⚠️ 权限不足</div>
          <p className="text-gray-600">只有管理员和老师可以访问团队设置</p>
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

        <h1 className="text-3xl font-bold mb-6">团队设置</h1>

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

        {/* 团队信息卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>团队信息</CardTitle>
            <CardDescription>管理团队的基本信息和头像</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 团队头像 */}
            <div className="flex items-start gap-6 pb-6 border-b">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
                disabled={!isEditing}
              />

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
                    alt={formData.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {formData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

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

              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  团队头像
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  点击头像或下方按钮上传新头像
                </p>
                <Button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={!isEditing}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {avatarPreview ? "更换头像" : "上传头像"}
                </Button>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>• 支持 JPG、PNG、GIF、WebP 格式</p>
                  <p>• 文件大小不超过 5MB</p>
                </div>

                {avatarPreview && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                    <Check className="w-4 h-4" />
                    新头像已选择，保存后生效
                  </div>
                )}
              </div>
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
                disabled={!isEditing}
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
                disabled={!isEditing}
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

        {/* 成员列表卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>团队成员</CardTitle>
            <CardDescription>团队成员列表</CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center text-gray-500 py-6">暂无成员数据</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map((m) => {
                  const isEditable = hasPermission; // admin 或 teacher 可以编辑
                  return (
                    <div key={m.user_id} className="p-0">
                      <div
                        className={`flex items-center gap-3 p-3 border rounded-lg bg-white ${
                          isEditable ? "cursor-pointer hover:shadow" : ""
                        }`}
                        onClick={() => {
                          if (!isEditable) return;
                          // 切换该成员到编辑模式，并初始化级别选择为当前级别
                          setEditingMemberId((prev) =>
                            prev === m.user_id ? null : m.user_id
                          );
                          setEditingMemberLevel(m.member_level || "normal");
                        }}
                      >
                        <Avatar className="h-10 w-10">
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
                          {/* 显示 member_level 的中文友好名称 */}
                          <div className="text-xs text-gray-500 mt-1">
                            {
                              (
                                {
                                  emperor: "最高级（emperor）",
                                  private_director:
                                    "私董 / 私人董事（private_director）",
                                  core: "核心会员（core）",
                                  normal: "普通会员（normal）",
                                } as Record<string, string>
                              )[m.member_level || "normal"]
                            }
                          </div>
                        </div>
                      </div>

                      {/* 编辑行：只对正在编辑的成员显示 */}
                      {editingMemberId === m.user_id && (
                        <div className="mt-2 p-3 bg-white border rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                            <div className="col-span-2">
                              <Label htmlFor={`member_level_${m.user_id}`}>
                                会员等级
                              </Label>
                              <Select
                                id={`member_level_${m.user_id}`}
                                value={editingMemberLevel}
                                onChange={(e) =>
                                  setEditingMemberLevel(e.target.value)
                                }
                              >
                                <option value="emperor">
                                  emperor（最高级别）
                                </option>
                                <option value="private_director">
                                  private_director（私董 / 私人董事）
                                </option>
                                <option value="core">core（核心会员）</option>
                                <option value="normal">
                                  normal（普通会员）
                                </option>
                                <option value="">无（取消等级）</option>
                              </Select>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={async (ev) => {
                                  ev.stopPropagation();
                                  if (editingMemberId !== m.user_id) return;
                                  setUpdatingMember(true);
                                  setMessage(null);
                                  try {
                                    const levelToSend =
                                      editingMemberLevel === ""
                                        ? null
                                        : editingMemberLevel;
                                    const res = await api.updateTeamMemberLevel(
                                      teamId,
                                      m.user_id,
                                      levelToSend
                                    );
                                    // 更新本地 state
                                    setTeamMembers((prev) =>
                                      prev.map((pm) =>
                                        pm.user_id === m.user_id
                                          ? {
                                              ...pm,
                                              member_level:
                                                res.member.member_level,
                                            }
                                          : pm
                                      )
                                    );
                                    setMessage({
                                      type: "success",
                                      text: res.message || "更新成功",
                                    });
                                    // 退出编辑
                                    setEditingMemberId(null);
                                  } catch (error: any) {
                                    setMessage({
                                      type: "error",
                                      text: error?.message || "更新失败",
                                    });
                                  } finally {
                                    setUpdatingMember(false);
                                  }
                                }}
                                size="sm"
                                disabled={updatingMember}
                              >
                                保存
                              </Button>
                              <Button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setEditingMemberId(null);
                                }}
                                variant="outline"
                                size="sm"
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
    </div>
  );
}
