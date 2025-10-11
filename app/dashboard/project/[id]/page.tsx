"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  generateMockProjectData,
  analyzeProjectData,
} from "@/lib/projectAnalysis";
import { AnalysisResult } from "@/types/project";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import BuyOrdersSection from "@/components/BuyOrdersSection";
import SellListingsSection from "@/components/SellListingsSection";
import TransactionsSection from "@/components/TransactionsSection";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [timeRange, setTimeRange] = useState(24); // 默认24小时
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [projectData, setProjectData] = useState<ReturnType<
    typeof generateMockProjectData
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setLoading(true);
    const data = generateMockProjectData(projectId);
    setProjectData(data);

    // 分析数据
    const result = analyzeProjectData(data.hourlyData, timeRange);
    setAnalysisResult(result);

    setLoading(false);
  }, [projectId, timeRange]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
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
          返回
        </button>

        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <img
            src={projectData.itemImage || "/file.svg"}
            alt={projectData.projectName}
            className="w-20 h-20 object-cover rounded"
          />
          <div>
            <h1 className="text-2xl font-bold">{projectData.projectName}</h1>
            <div className="text-sm text-gray-500 mt-1">
              项目ID: {projectData.projectId}
            </div>
            <div className="text-sm text-gray-500">数据更新频率: 每小时</div>
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
