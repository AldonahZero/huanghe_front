"use client";
import { UserTransactionStats, UserPairTransaction } from "@/types/project";
import { useState } from "react";

interface TransactionsSectionProps {
  topBuyers: UserTransactionStats[];
  topSellers: UserTransactionStats[];
  activePairs: UserPairTransaction[];
}

export default function TransactionsSection({
  topBuyers,
  topSellers,
  activePairs,
}: TransactionsSectionProps) {
  const [activeTab, setActiveTab] = useState<"buyers" | "sellers" | "pairs">(
    "buyers"
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">成交数据分析</h3>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "buyers"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("buyers")}
        >
          买入排行
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "sellers"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-600 hover:text-green-500"
          }`}
          onClick={() => setActiveTab("sellers")}
        >
          卖出排行
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "pairs"
              ? "border-b-2 border-purple-500 text-purple-600"
              : "text-gray-600 hover:text-purple-500"
          }`}
          onClick={() => setActiveTab("pairs")}
        >
          交易关系
        </button>
      </div>

      {/* 买入排行 */}
      {activeTab === "buyers" && (
        <div>
          <h4 className="text-lg font-medium mb-3">买入次数最多的用户</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {topBuyers.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 p-3 rounded border border-gray-200 hover:bg-blue-50 transition-all"
              >
                <div className="flex-shrink-0 text-gray-500 font-semibold w-8">
                  #{index + 1}
                </div>
                <img
                  src={user.avatarUrl || "/logo.ico"}
                  alt={user.userName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{user.userName}</div>
                  <div className="text-xs text-gray-500">ID: {user.userId}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {user.buyCount}
                  </div>
                  <div className="text-xs text-gray-500">买入次数</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{user.sellCount}</div>
                  <div className="text-xs text-gray-500">卖出次数</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 卖出排行 */}
      {activeTab === "sellers" && (
        <div>
          <h4 className="text-lg font-medium mb-3">卖出次数最多的用户</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {topSellers.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 p-3 rounded border border-gray-200 hover:bg-green-50 transition-all"
              >
                <div className="flex-shrink-0 text-gray-500 font-semibold w-8">
                  #{index + 1}
                </div>
                <img
                  src={user.avatarUrl || "/logo.ico"}
                  alt={user.userName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{user.userName}</div>
                  <div className="text-xs text-gray-500">ID: {user.userId}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{user.buyCount}</div>
                  <div className="text-xs text-gray-500">买入次数</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {user.sellCount}
                  </div>
                  <div className="text-xs text-gray-500">卖出次数</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 交易关系 */}
      {activeTab === "pairs" && (
        <div>
          <h4 className="text-lg font-medium mb-3">
            活跃交易对 (互相交易3次以上)
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activePairs.map((pair, index) => (
              <div
                key={`${pair.user1Id}-${pair.user2Id}`}
                className="border border-gray-200 rounded p-4 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">#{index + 1}</div>
                  <div className="text-lg font-bold text-purple-600">
                    总交易: {pair.totalTransactions}次
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* User 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="font-medium mb-1">{pair.user1Name}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {pair.user1Id}
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-600 font-semibold">
                        买入 {pair.user1BoughtFromUser2}次
                      </span>
                      <div className="text-xs text-gray-500">
                        (从 {pair.user2Name})
                      </div>
                    </div>
                  </div>

                  {/* 交换箭头 */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl">⇄</div>
                  </div>

                  {/* User 2 - 移到第二列 */}
                  <div className="flex flex-col items-center text-center col-start-2 row-start-1">
                    <div className="font-medium mb-1">{pair.user2Name}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {pair.user2Id}
                    </div>
                    <div className="text-sm">
                      <span className="text-green-600 font-semibold">
                        买入 {pair.user2BoughtFromUser1}次
                      </span>
                      <div className="text-xs text-gray-500">
                        (从 {pair.user1Name})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
