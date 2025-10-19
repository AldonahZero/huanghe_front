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
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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

  // 检查收藏状态
  useEffect(() => {
    if (authLoading || !token) return;

    api
      .checkFavoriteStatus(userId)
      .then((response) => {
        setIsFavorited(response.is_favorited);
      })
      .catch(() => {
        // 静默失败，不影响页面主要功能
      });
  }, [userId, authLoading, token]);

  // 切换收藏状态
  const handleToggleFavorite = async () => {
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await api.unfavoriteUser(userId);
        setIsFavorited(false);
      } else {
        await api.favoriteUser(userId);
        setIsFavorited(true);
      }
    } catch (err: any) {
      alert(err?.message || "操作失败，请重试");
    } finally {
      setFavoriteLoading(false);
    }
  };

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

  // 按 order_id/commodity_id 分组时间线数据
  const groupByOrder = <
    T extends {
      order_id?: string | null;
      commodity_id?: number;
      crawl_time: string;
      price: string | number | null;
    }
  >(
    timeline: T[]
  ): Map<string, T[]> => {
    const groups = new Map<string, T[]>();

    timeline.forEach((item) => {
      // 优先使用 order_id，如果为 null 则使用 commodity_id
      const key =
        item.order_id ||
        (item.commodity_id
          ? `commodity_${item.commodity_id}`
          : `unknown_${Math.random()}`);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // 对每个组内的数据按时间排序（最新在前）
    groups.forEach((items, key) => {
      groups.set(
        key,
        items.sort(
          (a, b) =>
            new Date(b.crawl_time).getTime() - new Date(a.crawl_time).getTime()
        )
      );
    });

    return groups;
  };

  // 计算价格变动百分比和方向
  const calculatePriceChange = (current: number, previous: number) => {
    const change = current - previous;
    const changePercent =
      previous !== 0 ? ((change / previous) * 100).toFixed(2) : "0.00";
    return {
      change,
      changePercent: Number(changePercent),
      direction: change > 0 ? "up" : change < 0 ? "down" : "same",
    };
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
  const avatarFromQuery =
    typeof window !== "undefined" ? searchParams?.get("avatar") : null;
  const avatarSrc = avatarFromQuery
    ? decodeURIComponent(avatarFromQuery)
    : undefined;
  const userNameFromQuery =
    typeof window !== "undefined" ? searchParams?.get("userName") : null;
  const storeNameFromQuery =
    typeof window !== "undefined" ? searchParams?.get("storeName") : null;

  const currentNickname =
    data.user_info.nickname_history[0]?.name ||
    userNameFromQuery ||
    `用户${userId}`;
  const currentStoreName =
    data.user_info.store_name_history[0]?.name ||
    storeNameFromQuery ||
    undefined;

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
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-2xl">{currentNickname}</CardTitle>
                  <div className="flex items-center gap-2">
                    {/* 收藏按钮 */}
                    <Button
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                      variant={isFavorited ? "default" : "outline"}
                      size="sm"
                      className={`gap-2 ${
                        isFavorited
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : ""
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorited ? "fill-current" : ""
                        }`}
                      />
                      {favoriteLoading
                        ? "处理中..."
                        : isFavorited
                        ? "已收藏"
                        : "收藏"}
                    </Button>
                    {/* 访问商店按钮 */}
                    <a
                      href={`https://hybrid.youpin898.com/index.html#/shop/${userId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      访问商店
                    </a>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div>用户ID: {userId}</div>

                  {/* 昵称历史展开 */}
                  {data.user_info.nickname_history.length > 0 && (
                    <div>
                      <button
                        onClick={() =>
                          setShowNicknameHistory(!showNicknameHistory)
                        }
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
                      {showNicknameHistory &&
                        data.user_info.nickname_history.length > 1 && (
                          <div className="mt-2 ml-4 space-y-2 text-xs animate-in slide-in-from-top-2 duration-200">
                            <div className="text-gray-400 mb-1">历史昵称:</div>
                            {data.user_info.nickname_history.map(
                              (record, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded px-3 py-2 flex items-start gap-2"
                                >
                                  <Badge
                                    variant="secondary"
                                    className="text-xs shrink-0"
                                  >
                                    {record.name}
                                  </Badge>
                                  <span className="text-gray-500 text-[11px] leading-5">
                                    {formatDate(record.first_seen)}
                                    <br />~ {formatDate(record.last_seen)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  )}

                  {/* 店铺名历史展开 */}
                  {currentStoreName && (
                    <div>
                      <button
                        onClick={() =>
                          setShowStoreNameHistory(!showStoreNameHistory)
                        }
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
                      {showStoreNameHistory &&
                        data.user_info.store_name_history.length > 1 && (
                          <div className="mt-2 ml-4 space-y-2 text-xs animate-in slide-in-from-top-2 duration-200">
                            <div className="text-gray-400 mb-1">
                              历史店铺名:
                            </div>
                            {data.user_info.store_name_history.map(
                              (record, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded px-3 py-2 flex items-start gap-2"
                                >
                                  <Badge
                                    variant="secondary"
                                    className="text-xs shrink-0"
                                  >
                                    {record.name}
                                  </Badge>
                                  <span className="text-gray-500 text-[11px] leading-5">
                                    {formatDate(record.first_seen)}
                                    <br />~ {formatDate(record.last_seen)}
                                  </span>
                                </div>
                              )
                            )}
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

        {/* 在售商品 */}
        {data.sell_commodities && data.sell_commodities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                在售商品
              </CardTitle>
              <CardDescription>
                共 {data.sell_commodities.length} 件商品在售
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {data.sell_commodities.map((commodity) => (
                  <div
                    key={commodity.commodity_id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-all"
                  >
                    {/* 商品头部 */}
                    <div className="mb-3">
                      <div className="font-semibold text-gray-900 mb-2 flex items-start justify-between">
                        <span className="flex-1 min-w-0 line-clamp-2">
                          {commodity.template_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                        {commodity.exterior_name && (
                          <Badge variant="secondary" className="text-xs">
                            {commodity.exterior_name}
                          </Badge>
                        )}
                        <span>
                          磨损: {parseFloat(commodity.abrade).toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* 价格信息 */}
                    <div className="mb-3 pb-3 border-b">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatPrice(commodity.price)}
                          </div>
                          {commodity.original_price &&
                            commodity.original_price !== commodity.price && (
                              <div className="text-xs text-gray-400 line-through">
                                原价: {formatPrice(commodity.original_price)}
                              </div>
                            )}
                        </div>
                        {commodity.can_bargain && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                            可议价
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 印花信息 */}
                    {commodity.stickers && commodity.stickers.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          印花 ({commodity.stickers.length}):
                        </div>
                        <div className="space-y-2">
                          {commodity.stickers
                            .slice(0, 4)
                            .map((sticker, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-xs"
                              >
                                <img
                                  src={sticker.imgUrl}
                                  alt={sticker.name}
                                  className="w-8 h-8 object-contain rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="truncate text-gray-700">
                                    {sticker.name}
                                  </div>
                                  <div className="text-gray-400 text-[10px]">
                                    {sticker.stickerDesc} · {sticker.priceV1}
                                  </div>
                                </div>
                              </div>
                            ))}
                          {commodity.stickers.length > 4 && (
                            <div className="text-xs text-gray-400 text-center">
                              +{commodity.stickers.length - 4} 更多印花
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 商品ID信息 */}
                    <div className="text-xs text-gray-400 pt-2 border-t">
                      <div>商品ID: {commodity.commodity_id}</div>
                      {commodity.commodity_no && (
                        <div>商品编号: {commodity.commodity_no}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 挂售时间线 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              挂售订单时间线
            </CardTitle>
            <CardDescription>
              共 {groupByOrder(data.sell_timeline).size} 个订单，
              {data.sell_timeline.length} 条记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.sell_timeline.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无挂售记录</div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Array.from(groupByOrder(data.sell_timeline).entries())
                  .slice(0, 30)
                  .map(([orderId, items]) => {
                    const latestItem = items[0]; // 最新的现在在数组开头
                    const firstItem = items[items.length - 1]; // 最早的在数组末尾

                    return (
                      <div
                        key={orderId}
                        className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all"
                      >
                        {/* 订单头部信息 */}
                        <div className="flex items-start justify-between mb-3 pb-3 border-b">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                              {latestItem.template_name || "未知商品"}
                              {latestItem.quantity &&
                                latestItem.quantity > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    数量: {latestItem.quantity}
                                  </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>订单ID: {orderId}</span>
                              {latestItem.commodity_no && (
                                <span>商品编号: {latestItem.commodity_no}</span>
                              )}
                              <span>位次: #{latestItem.position}</span>
                              <span>
                                磨损: {parseFloat(latestItem.abrade).toFixed(4)}
                              </span>
                              {latestItem.exterior_name && (
                                <Badge variant="secondary" className="text-xs">
                                  {latestItem.exterior_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-500">
                              {formatPrice(latestItem.price)}
                            </div>
                            <div className="text-xs text-gray-400">
                              当前价格
                            </div>
                          </div>
                        </div>

                        {/* 价格变动时间线 */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600 mb-2">
                            价格变动历史 ({items.length} 次记录):
                          </div>
                          <div className="space-y-1.5">
                            {items.map((item, idx) => {
                              // 现在数组是从新到旧，所以 idx+1 是更旧的记录
                              const prevItem =
                                idx < items.length - 1 ? items[idx + 1] : null;
                              const currentPrice = Number(item.price);
                              const prevPrice = prevItem
                                ? Number(prevItem.price)
                                : null;

                              let priceChange = null;
                              if (
                                prevPrice !== null &&
                                prevPrice !== currentPrice
                              ) {
                                priceChange = calculatePriceChange(
                                  currentPrice,
                                  prevPrice
                                );
                              }

                              const isLatest = idx === 0; // 最新的现在是第一条（索引0）

                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-3 text-sm p-2 rounded ${
                                    isLatest
                                      ? "bg-amber-50 border border-amber-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <div className="text-xs text-gray-400 w-32 flex-shrink-0">
                                    {formatDate(item.crawl_time)}
                                  </div>

                                  <div
                                    className={`font-semibold ${
                                      isLatest
                                        ? "text-amber-600"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {formatPrice(item.price)}
                                  </div>

                                  {priceChange && (
                                    <div className="flex items-center gap-1">
                                      {priceChange.direction === "up" ? (
                                        <>
                                          <TrendingUp className="w-4 h-4 text-red-500" />
                                          <span className="text-red-500 text-xs font-medium">
                                            +{formatPrice(priceChange.change)}{" "}
                                            (+{priceChange.changePercent}%)
                                          </span>
                                        </>
                                      ) : priceChange.direction === "down" ? (
                                        <>
                                          <TrendingDown className="w-4 h-4 text-green-500" />
                                          <span className="text-green-500 text-xs font-medium">
                                            {formatPrice(priceChange.change)} (
                                            {priceChange.changePercent}%)
                                          </span>
                                        </>
                                      ) : null}
                                    </div>
                                  )}

                                  {isLatest && (
                                    <Badge className="ml-auto bg-amber-500 text-white">
                                      最新
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 印花信息 */}
                        {latestItem.stickers &&
                          latestItem.stickers.length > 0 && (
                            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                              <span className="font-medium">印花: </span>
                              {latestItem.stickers
                                .map((s) => s.Name)
                                .join(", ")}
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 求购订单时间线 */}
        {data.purchase_timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                求购订单时间线
              </CardTitle>
              <CardDescription>
                共 {groupByOrder(data.purchase_timeline).size} 个订单，
                {data.purchase_timeline.length} 条记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Array.from(groupByOrder(data.purchase_timeline).entries())
                  .slice(0, 30)
                  .map(([orderId, items]) => {
                    const latestItem = items[0]; // 最新的现在在数组开头
                    const firstItem = items[items.length - 1]; // 最早的在数组末尾

                    return (
                      <div
                        key={orderId}
                        className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all"
                      >
                        {/* 订单头部信息 */}
                        <div className="flex items-start justify-between mb-3 pb-3 border-b">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                              {latestItem.template_name || "未知商品"}
                              {latestItem.quantity &&
                                latestItem.quantity > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    数量: {latestItem.quantity}
                                  </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>订单ID: {orderId}</span>
                              <span>位次: #{latestItem.position}</span>
                              {latestItem.abrade &&
                                latestItem.abrade !== "null" && (
                                  <span>
                                    磨损:{" "}
                                    {parseFloat(latestItem.abrade).toFixed(4)}
                                  </span>
                                )}
                              {(latestItem.abrade_min ||
                                latestItem.abrade_max) && (
                                <span>
                                  磨损范围: {latestItem.abrade_min || "0.00"} ~{" "}
                                  {latestItem.abrade_max || "1.00"}
                                </span>
                              )}
                              {latestItem.exterior_name && (
                                <Badge variant="secondary" className="text-xs">
                                  {latestItem.exterior_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-500">
                              {latestItem.price
                                ? formatPrice(latestItem.price)
                                : "未设置"}
                            </div>
                            <div className="text-xs text-gray-400">
                              当前价格
                            </div>
                          </div>
                        </div>

                        {/* 价格变动时间线 */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600 mb-2">
                            价格变动历史 ({items.length} 次记录):
                          </div>
                          <div className="space-y-1.5">
                            {items.map((item, idx) => {
                              // 现在数组是从新到旧，所以 idx+1 是更旧的记录
                              const prevItem =
                                idx < items.length - 1 ? items[idx + 1] : null;
                              const currentPrice = item.price
                                ? Number(item.price)
                                : 0;
                              const prevPrice =
                                prevItem && prevItem.price
                                  ? Number(prevItem.price)
                                  : null;

                              let priceChange = null;
                              if (
                                prevPrice !== null &&
                                prevPrice !== currentPrice &&
                                currentPrice > 0
                              ) {
                                priceChange = calculatePriceChange(
                                  currentPrice,
                                  prevPrice
                                );
                              }

                              const isLatest = idx === 0; // 最新的现在是第一条（索引0）

                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-3 text-sm p-2 rounded ${
                                    isLatest
                                      ? "bg-amber-50 border border-amber-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <div className="text-xs text-gray-400 w-32 flex-shrink-0">
                                    {formatDate(item.crawl_time)}
                                  </div>

                                  <div
                                    className={`font-semibold ${
                                      isLatest
                                        ? "text-amber-600"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {item.price
                                      ? formatPrice(item.price)
                                      : "未设置"}
                                  </div>

                                  {priceChange && (
                                    <div className="flex items-center gap-1">
                                      {priceChange.direction === "up" ? (
                                        <>
                                          <TrendingUp className="w-4 h-4 text-red-500" />
                                          <span className="text-red-500 text-xs font-medium">
                                            +{formatPrice(priceChange.change)}{" "}
                                            (+{priceChange.changePercent}%)
                                          </span>
                                        </>
                                      ) : priceChange.direction === "down" ? (
                                        <>
                                          <TrendingDown className="w-4 h-4 text-green-500" />
                                          <span className="text-green-500 text-xs font-medium">
                                            {formatPrice(priceChange.change)} (
                                            {priceChange.changePercent}%)
                                          </span>
                                        </>
                                      ) : null}
                                    </div>
                                  )}

                                  {isLatest && (
                                    <Badge className="ml-auto bg-amber-500 text-white">
                                      最新
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 印花信息 */}
                        {latestItem.stickers &&
                          latestItem.stickers.length > 0 && (
                            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                              <span className="font-medium">印花: </span>
                              {latestItem.stickers
                                .map((s) => s.Name)
                                .join(", ")}
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
