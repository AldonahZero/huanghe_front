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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 检查权限
  const hasPermission = user?.role === "admin" || user?.role === "teacher";

  useEffect(() => {
    if (user && hasPermission) {
      loadTeams();
    }
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

  if (!user || !hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4 text-xl">⚠️ 权限不足</div>
          <p className="text-gray-600">只有管理员和老师可以访问团队管理</p>
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
            <h1 className="text-3xl font-bold mb-2">团队管理</h1>
            <p className="text-gray-600">
              {user.role === "admin"
                ? "管理员可以查看和管理所有团队"
                : "老师可以管理自己的团队"}
            </p>
          </div>
          <Button onClick={loadTeams} variant="outline" disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            刷新
          </Button>
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

        {/* 团队列表 */}
        {teams.length === 0 ? (
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
                        ID: {team.id}
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
                      <div className="text-gray-500 text-xs mb-1">成员数量</div>
                      <div className="font-semibold text-gray-900">
                        {team.member_count || 0} 人
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-500 text-xs mb-1">创建者</div>
                      <div className="font-semibold text-gray-900 truncate">
                        {team.owner_name || `ID:${team.owner_id}`}
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
        )}
      </div>
    </div>
  );
}
