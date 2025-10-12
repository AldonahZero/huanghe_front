"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  generateMockProjectData,
  analyzeProjectData,
} from "@/lib/projectAnalysis";
import { AnalysisResult } from "@/types/project";
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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [projectData, setProjectData] = useState<ReturnType<
    typeof generateMockProjectData
  > | null>(null);
  const [realProjectData, setRealProjectData] = useState<any>(null);
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

    // Load real project data from backend
    setLoading(true);
    api
      .getProject(Number(projectId))
      .then((project: any) => {
        if (!mounted) return;
        setRealProjectData(project);

        // Still use mock data for analysis sections (until backend provides analysis data)
        const data = generateMockProjectData(projectId);
        setProjectData(data);
        const result = analyzeProjectData(data.hourlyData, timeRange);
        setAnalysisResult(result);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "加载项目失败");
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

  if (loading || !projectData || !analysisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">加载数据中...</div>
        </div>
      </div>
    );
  }

  // Extract real project info
  const item = realProjectData?.item || {};
  const itemName =
    item.market_name ||
    item.market_hash_name ||
    realProjectData?.name ||
    projectData.projectName;
  const itemImage = item.icon_url || projectData.itemImage || "/file.svg";
  const itemExterior = item.exterior || "";
  const itemWeapon = item.weapon || "";
  const itemRarity = item.rarity || "";
  const isActive = realProjectData?.is_active ?? true;
  const createdAt = realProjectData?.created_at;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="mb-4" style={{ zIndex: 1000, position: "relative" }}>
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
                数据更新频率: 每小时
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
            {analysisResult.topBuyers.reduce((sum, b) => sum + b.orderCount, 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            活跃求购者: {analysisResult.topBuyers.length}人
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">挂售总数</div>
          <div className="text-2xl font-bold text-green-600">
            {analysisResult.topSellers.reduce(
              (sum, s) => sum + s.listingCount,
              0
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            活跃卖家: {analysisResult.topSellers.length}人
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">成交总数</div>
          <div className="text-2xl font-bold text-purple-600">
            {analysisResult.topBuyers_transactions.reduce(
              (sum, u) => sum + u.totalCount,
              0
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            活跃交易对: {analysisResult.activePairs.length}组
          </div>
        </div>
      </div>

      {/* 求购数据 */}
      <div className="mb-6">
        <BuyOrdersSection
          topBuyers={analysisResult.topBuyers}
          positionDistribution={analysisResult.buyerPositionDistribution}
        />
      </div>

      {/* 在售数据 */}
      <div className="mb-6">
        <SellListingsSection topSellers={analysisResult.topSellers} />
      </div>

      {/* 成交数据 */}
      <div className="mb-6">
        <TransactionsSection
          topBuyers={analysisResult.topBuyers_transactions}
          topSellers={analysisResult.topSellers_transactions}
          activePairs={analysisResult.activePairs}
        />
      </div>
    </div>
  );
}
