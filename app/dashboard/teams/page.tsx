"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import * as api from "@/lib/api";
import { Users, Settings, RefreshCw } from "lucide-react";

export default function TeamsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<api.TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState<api.TeamInfo | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 检查权限
  const hasPermission = user?.role === "admin" || user?.role === "teacher";

  useEffect(() => {
    if (!user) return;
    if (hasPermission) {
      loadTeams();
    } else {
      loadMyTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasPermission]);

  const loadTeams = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.getTeams();
      setTeams(response.teams);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "加载团队列表失败",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMyTeam = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (!user) return;
      const response = await api.getTeamByUserId(user.id);
      setMyTeam(response.team);
    } catch (error: any) {
      // 如果用户尚未加入团队或接口报错，优雅提示
      setMyTeam(null);
      setMessage({
        type: "error",
        text: error?.message || "未获取到你的团队信息",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId: number) => {
    router.push(`/dashboard/teams/${teamId}`);
  };

  // 权限检查
  if (authLoading || loading) {
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
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {hasPermission ? "团队管理" : "我的团队"}
            </h1>
            <p className="text-gray-600">
              {hasPermission
                ? user.role === "admin"
                  ? "管理员可以查看和管理所有团队"
                  : "老师可以管理自己的团队"
                : "会员可以查看自己所属的团队信息（只读）"}
            </p>
          </div>
          {hasPermission ? (
            <Button onClick={loadTeams} variant="outline" disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          ) : (
            <Button onClick={loadMyTeam} variant="outline" disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          )}
        </div>

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

        {/* 列表或我的团队 */}
        {hasPermission ? (
          teams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">暂无团队</p>
                <p className="text-gray-500 text-sm mt-2">
                  {user.role === "admin"
                    ? "系统中还没有任何团队"
                    : "您还没有创建团队"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleTeamClick(team.id)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-transparent group-hover:ring-indigo-500 transition-all">
                        <AvatarImage
                          src={team.avatar_url || "/logo.ico"}
                          alt={team.name}
                        />
                        <AvatarFallback className="text-2xl">
                          {team.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-1 truncate">
                          {team.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {team.owner_nickname ||
                            team.owner_name ||
                            `ID: ${team.owner_id}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {team.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {team.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-gray-500 text-xs mb-1">
                          成员数量
                        </div>
                        <div className="font-semibold text-gray-900">
                          {team.member_count || 0} 人
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-gray-500 text-xs mb-1">创建者</div>
                        <div className="font-semibold text-gray-900 truncate">
                          {team.owner_nickname ||
                            team.owner_name ||
                            `ID: ${team.owner_id}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      创建时间:{" "}
                      {new Date(team.created_at).toLocaleDateString("zh-CN")}
                    </div>

                    <Button
                      className="w-full mt-3 group-hover:bg-indigo-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTeamClick(team.id);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      管理团队
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <>
            {myTeam ? (
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer group max-w-3xl"
                onClick={() => handleTeamClick(myTeam.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-transparent group-hover:ring-indigo-500 transition-all">
                      <AvatarImage
                        src={myTeam.avatar_url || "/logo.ico"}
                        alt={myTeam.name}
                      />
                      <AvatarFallback className="text-2xl">
                        {myTeam.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-1 truncate">
                        {myTeam.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {myTeam.owner_nickname ||
                          myTeam.owner_name ||
                          `ID: ${myTeam.owner_id}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myTeam.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {myTeam.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-xs mb-1">成员数量</div>
                      <div className="font-semibold text-gray-900">
                        {myTeam.member_count || 0} 人
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-xs mb-1">创建时间</div>
                      <div className="font-semibold text-gray-900 truncate">
                        {new Date(myTeam.created_at).toLocaleDateString(
                          "zh-CN"
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-3 group-hover:bg-indigo-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTeamClick(myTeam.id);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    查看团队
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">你暂未加入任何团队</p>
                  <p className="text-gray-500 text-sm mt-2">
                    请联系管理员或老师，邀请你加入团队
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
