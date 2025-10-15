"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import BuyOrdersSection from "@/components/BuyOrdersSection";
import SellListingsSection from "@/components/SellListingsSection";
import TransactionsSection from "@/components/TransactionsSection";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { token, loading: authLoading } = useAuth();

  const [timeRange, setTimeRange] = useState(24); // 默认24小时
  const [analysisData, setAnalysisData] =
    useState<api.ProjectAnalysisResponse | null>(null);
  const [statistics, setStatistics] = useState<
    api.ProjectAnalysisResponse["statistics"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Wait for auth to finish loading
    if (authLoading) return;

    if (!token) {
      setError("未授权，请先登录");
      setLoading(false);
      return;
    }

    // Load project analysis data from backend
    setLoading(true);
    api
      .getProjectAnalysis(Number(projectId), timeRange)
      .then((response) => {
        if (!mounted) return;
        setAnalysisData(response);
        setStatistics(response.statistics);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "加载项目分析数据失败");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [projectId, timeRange, authLoading, token]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">验证身份中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:underline"
          >
            返回仪表盘
          </button>
        </div>
      </div>
    );
  }

  if (loading || !analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">加载数据中...</div>
        </div>
      </div>
    );
  }

  // Extract project info from backend response
  const project = analysisData.project;
  const analysis = analysisData.analysis;
  const item = project.item;
  const itemName = item?.market_name || project.name;
  const itemImage = item?.icon_url || "/file.svg";
  const itemExterior = item?.exterior || "";
  const itemWeapon = item?.weapon || "";
  const itemRarity = ""; // Backend doesn't return rarity in item object
  const isActive = project.is_active;
  const createdAt = project.created_at;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 返回按钮 */}
      <div className="mb-6" style={{ zIndex: 1000, position: "relative" }}>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors no-underline"
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回仪表盘
        </a>
      </div>

      {/* Flexbox布局：左侧装饰面板 + 右侧主要内容 */}
      <div className="flex gap-6">
        {/* 左侧装饰面板 */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          {/* 项目概览卡片 */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">项目概览</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="opacity-90">项目ID:</span>
                <span className="font-medium">#{projectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">状态:</span>
                <span className="font-medium">
                  {isActive ? "🟢 启动中" : "⏸️ 已暂停"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">更新频率:</span>
                <span className="font-medium">
                  {project.crawl_interval || 60}分钟
                </span>
              </div>
            </div>
          </div>

          {/* 时间范围卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              数据时间范围
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>当前: {timeRange}小时</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                调整时间范围以查看不同周期的数据分析
              </p>
            </div>
          </div>

          {/* 快速统计卡片 */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">快速统计</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="opacity-90">求购:</span>
                <span className="font-medium">
                  {statistics?.totalBuyOrders || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">挂售:</span>
                <span className="font-medium">
                  {statistics?.totalSellListings || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">均价:</span>
                <span className="font-medium">
                  ¥{statistics?.avgPrice.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* 提示卡片 */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-3">💡 数据说明</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              数据每{project.crawl_interval || 60}
              分钟更新一次,反映市场实时变化。可随时调整监控频率。
            </p>
          </div>
        </aside>

        {/* 右侧主要内容 */}
        <div className="flex-1 min-w-0">
          {/* 页面头部 - 项目信息卡片 */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <img
                  src={itemImage}
                  alt={itemName}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/file.svg";
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{itemName}</h1>
                      {itemExterior && (
                        <div className="text-sm text-gray-500 mt-1">
                          {itemExterior}
                        </div>
                      )}
                    </div>
                    {isActive ? (
                      <Badge variant="success" className="gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        启动中
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <span>⏸️</span>
                        已暂停
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {itemWeapon && (
                      <div>
                        <span className="text-gray-500">武器：</span>
                        <span className="font-medium">{itemWeapon}</span>
                      </div>
                    )}
                    {itemRarity && (
                      <div>
                        <span className="text-gray-500">稀有度：</span>
                        <span className="font-medium">{itemRarity}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">项目ID：</span>
                      <span className="font-medium">{projectId}</span>
                    </div>
                    {createdAt && (
                      <div>
                        <span className="text-gray-500">启动时间：</span>
                        <span className="font-medium">
                          {new Date(createdAt).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-3">
                    数据更新频率: 每{project.crawl_interval || 60}分钟
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 时间范围选择器 */}
          <div className="mb-6">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>

          {/* 数据统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-1">求购总数</div>
              <div className="text-2xl font-bold text-blue-600">
                {statistics?.totalBuyOrders || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                活跃求购者: {statistics?.activeBuyers || 0}人
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-1">挂售总数</div>
              <div className="text-2xl font-bold text-green-600">
                {statistics?.totalSellListings || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                活跃卖家: {statistics?.activeSellers || 0}人
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-1">平均价格</div>
              <div className="text-2xl font-bold text-purple-600">
                ¥{statistics?.avgPrice.toFixed(2) || "0.00"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                最高: ¥{statistics?.maxPrice.toFixed(2)} / 最低: ¥
                {statistics?.minPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* 求购数据 */}
          <div className="mb-6">
            <BuyOrdersSection
              topBuyers={analysis.topBuyers}
              positionDistribution={analysis.buyerPositionDistribution}
            />
          </div>

          {/* 在售数据 */}
          <div className="mb-6">
            <SellListingsSection topSellers={analysis.topSellers} />
          </div>

          {/* 成交数据 */}
          {(analysis.topBuyers_transactions.length > 0 ||
            analysis.topSellers_transactions.length > 0 ||
            analysis.activePairs.length > 0) && (
            <div className="mb-6">
              <TransactionsSection
                topBuyers={analysis.topBuyers_transactions}
                topSellers={analysis.topSellers_transactions}
                activePairs={analysis.activePairs}
              />
            </div>
          )}

          {/* 交易数据加密提示 */}
          {analysis.topBuyers_transactions.length === 0 &&
            analysis.topSellers_transactions.length === 0 &&
            analysis.activePairs.length === 0 && (
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-yellow-800 text-lg font-medium mb-2">
                    🔒 交易数据已加密
                  </div>
                  <div className="text-yellow-600 text-sm">
                    成交买入榜、成交卖出榜和活跃交易对数据目前无法获取
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
