"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function UserTradingBehaviorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = parseInt(params.userId as string);
  const { token, loading: authLoading } = useAuth();

  const [data, setData] = useState<api.TradingBehaviorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNicknameHistory, setShowNicknameHistory] = useState(false);
  const [showStoreNameHistory, setShowStoreNameHistory] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setError("未授权，请先登录");
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .getUserTradingBehavior(userId)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "加载用户交易行为失败");
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, authLoading, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string | number) => {
    return `¥${Number(price).toLocaleString("zh-CN")}`;
  };

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4 text-xl">⚠️ {error}</div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // 从查询参数读取 avatar/userName/storeName
  const avatarFromQuery = typeof window !== "undefined" ? searchParams?.get("avatar") : null;
  const avatarSrc = avatarFromQuery ? decodeURIComponent(avatarFromQuery) : undefined;
  const userNameFromQuery = typeof window !== "undefined" ? searchParams?.get("userName") : null;
  const storeNameFromQuery = typeof window !== "undefined" ? searchParams?.get("storeName") : null;

  const currentNickname =
    data.user_info.nickname_history[0]?.name || userNameFromQuery || `用户${userId}`;
  const currentStoreName = data.user_info.store_name_history[0]?.name || storeNameFromQuery || undefined;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回上一页
      </button>

      <div className="max-w-7xl mx-auto">
        {/* 用户信息卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarSrc || "/logo.ico"} />
                <AvatarFallback className="text-2xl">
                  {currentNickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {currentNickname}
                </CardTitle>
                <div className="space-y-3 text-sm text-gray-600">
                  <div>用户ID: {userId}</div>
                  
                  {/* 昵称历史展开 */}
                  {data.user_info.nickname_history.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowNicknameHistory(!showNicknameHistory)}
                        className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                      >
                        <span>昵称: {currentNickname}</span>
                        {data.user_info.nickname_history.length > 1 && (
                          <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                            {showNicknameHistory ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </button>
                      {showNicknameHistory && data.user_info.nickname_history.length > 1 && (
                        <div className="mt-2 ml-4 space-y-2 text-xs animate-in slide-in-from-top-2 duration-200">
                          <div className="text-gray-400 mb-1">历史昵称:</div>
                          {data.user_info.nickname_history.map((record, index) => (
                            <div key={index} className="bg-gray-50 rounded px-3 py-2 flex items-start gap-2">
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {record.name}
                              </Badge>
                              <span className="text-gray-500 text-[11px] leading-5">
                                {formatDate(record.first_seen)}<br />~ {formatDate(record.last_seen)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 店铺名历史展开 */}
                  {currentStoreName && (
                    <div>
                      <button
                        onClick={() => setShowStoreNameHistory(!showStoreNameHistory)}
                        className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                      >
                        <span>店铺名: {currentStoreName}</span>
                        {data.user_info.store_name_history.length > 1 && (
                          <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                            {showStoreNameHistory ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </button>
                      {showStoreNameHistory && data.user_info.store_name_history.length > 1 && (
                        <div className="mt-2 ml-4 space-y-2 text-xs animate-in slide-in-from-top-2 duration-200">
                          <div className="text-gray-400 mb-1">历史店铺名:</div>
                          {data.user_info.store_name_history.map((record, index) => (
                            <div key={index} className="bg-gray-50 rounded px-3 py-2 flex items-start gap-2">
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {record.name}
                              </Badge>
                              <span className="text-gray-500 text-[11px] leading-5">
                                {formatDate(record.first_seen)}<br />~ {formatDate(record.last_seen)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    数据更新时间: {formatDate(data.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 统计卡片组 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">当前页商品数</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.summary.current_page_count}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">总出售次数</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.summary.total_sell_count}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">在售列表数</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {data.summary.active_listings}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">发货成功率</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {data.delivery_statistics.deliver_success_rate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 发货统计 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              发货统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">平均发货时长</div>
                <div className="text-xl font-semibold">
                  {data.delivery_statistics.avg_deliver_time}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">发货成功率</div>
                <div className="text-xl font-semibold text-green-600">
                  {data.delivery_statistics.deliver_success_rate}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">未发货次数</div>
                <div className="text-xl font-semibold text-red-600">
                  {data.delivery_statistics.un_deliver_number}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 挂售时间线 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              挂售时间线
            </CardTitle>
            <CardDescription>
              共 {data.sell_timeline.length} 条记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.sell_timeline.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无挂售记录</div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {data.sell_timeline.slice(0, 50).map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">
                          {item.template_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            价格: {formatPrice(item.price)}
                          </span>
                          <span>位次: #{item.position}</span>
                          <span>
                            磨损: {parseFloat(item.abrade).toFixed(4)}
                          </span>
                          {item.exterior_name && (
                            <Badge variant="secondary">
                              {item.exterior_name}
                            </Badge>
                          )}
                        </div>
                        {item.stickers && item.stickers.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            印花: {item.stickers.map((s) => s.Name).join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                        {formatDate(item.crawl_time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 求购时间线 */}
        {data.purchase_timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                求购时间线
              </CardTitle>
              <CardDescription>
                共 {data.purchase_timeline.length} 条记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {data.purchase_timeline.slice(0, 50).map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">
                          {item.template_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            价格: {formatPrice(item.price)}
                          </span>
                          <span>位次: #{item.position}</span>
                          <span>
                            磨损: {parseFloat(item.abrade).toFixed(4)}
                          </span>
                          {item.exterior_name && (
                            <Badge variant="secondary">
                              {item.exterior_name}
                            </Badge>
                          )}
                        </div>
                        {item.stickers && item.stickers.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            印花: {item.stickers.map((s) => s.Name).join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                        {formatDate(item.crawl_time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 历史信息 */}
        {(data.user_info.nickname_history.length > 1 ||
          data.user_info.store_name_history.length > 1) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>历史信息</CardTitle>
            </CardHeader>
            <CardContent>
              {data.user_info.nickname_history.length > 1 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    昵称历史
                  </div>
                  <div className="space-y-2">
                    {data.user_info.nickname_history.map((record, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <span className="font-medium">{record.name}</span>
                        <span className="text-xs text-gray-400">
                          ({formatDate(record.first_seen)} ~{" "}
                          {formatDate(record.last_seen)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.user_info.store_name_history.length > 1 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    店铺名历史
                  </div>
                  <div className="space-y-2">
                    {data.user_info.store_name_history.map((record, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <span className="font-medium">{record.name}</span>
                        <span className="text-xs text-gray-400">
                          ({formatDate(record.first_seen)} ~{" "}
                          {formatDate(record.last_seen)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
