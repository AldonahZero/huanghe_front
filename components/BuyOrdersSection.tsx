"use client";
import { BuyOrder, PositionDistribution } from "@/types/project";
import { useState } from "react";

interface BuyOrdersSectionProps {
  topBuyers: BuyOrder[];
  positionDistribution: PositionDistribution[];
}

export default function BuyOrdersSection({
  topBuyers,
  positionDistribution,
}: BuyOrdersSectionProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const selectedDistribution = positionDistribution.find(
    (d) => d.userId === selectedUser
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">求购数据分析</h3>

      {/* 前30名求购者 */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3">前30名求购者</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {topBuyers.map((buyer, index) => (
            <div
              key={buyer.userId}
              className={`flex items-center gap-3 p-3 rounded border transition-all cursor-pointer ${
                selectedUser === buyer.userId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedUser(buyer.userId)}
            >
              <div className="flex-shrink-0 text-gray-500 font-semibold w-8">
                #{index + 1}
              </div>
              <img
                src={buyer.avatarUrl || "/logo.ico"}
                alt={buyer.userName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{buyer.userName}</div>
                <div className="text-xs text-gray-500 truncate">
                  ID: {buyer.userId}
                </div>
                <div className="text-sm text-blue-600 font-semibold">
                  求购: {buyer.orderCount}次
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 位次分布 */}
      {positionDistribution.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-3">
            频繁求购者位次分布
            {selectedDistribution && (
              <span className="text-sm text-gray-500 ml-2">
                (当前选中: {selectedDistribution.userName})
              </span>
            )}
          </h4>
          <div className="space-y-4">
            {(selectedDistribution
              ? [selectedDistribution]
              : positionDistribution.slice(0, 5)
            ).map((dist) => (
              <div key={dist.userId} className="border rounded p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="font-medium">{dist.userName}</div>
                  <div className="text-xs text-gray-500">ID: {dist.userId}</div>
                  <div className="ml-auto text-sm text-gray-600">
                    总求购: {dist.totalOrders}次
                  </div>
                </div>

                {/* 位次分布可视化 */}
                <div className="space-y-2">
                  {dist.positions
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((pos) => {
                      const percentage = (pos.count / dist.totalOrders) * 100;
                      return (
                        <div
                          key={pos.position}
                          className="flex items-center gap-2"
                        >
                          <div className="text-sm text-gray-600 w-16">
                            位次 {pos.position}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {pos.count}次 ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
