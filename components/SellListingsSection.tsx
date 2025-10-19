"use client";
import { SellListing } from "@/types/project";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

interface SellListingsSectionProps {
  topSellers: SellListing[];
}

export default function SellListingsSection({
  topSellers,
}: SellListingsSectionProps) {
  const router = useRouter();

  const handleViewTrading = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 将卖家头像/用户名/店铺名作为查询参数传递
    const seller = topSellers.find((s) => s.userId === userId);
    const params = new URLSearchParams();
    if (seller?.avatarUrl) params.set("avatar", seller.avatarUrl);
    if (seller?.userName) params.set("userName", seller.userName);
    if ((seller as any)?.storeName)
      params.set("storeName", (seller as any).storeName);
    const qs = params.toString();
    const url = qs
      ? `/dashboard/users/${userId}/trading-behavior?${qs}`
      : `/dashboard/users/${userId}/trading-behavior`;
    router.push(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">在售数据分析</h3>

      {/* 前30名挂售者 */}
      <div>
        <h4 className="text-lg font-medium mb-3">前30名挂售者</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {topSellers.map((seller, index) => (
            <div
              key={seller.userId}
              className="flex items-center gap-3 p-3 rounded border border-gray-200 hover:border-green-300 transition-all"
            >
              <div className="flex-shrink-0 text-gray-500 font-semibold w-8">
                #{index + 1}
              </div>
              <img
                src={seller.avatarUrl || "/logo.ico"}
                alt={seller.userNickName || seller.userName}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.ico";
                }}
              />
              <div className="flex-1 min-w-0">
                {/* 店铺名称 */}
                {seller.storeName && (
                  <div className="font-medium truncate text-gray-800">
                    🏪 {seller.storeName}
                  </div>
                )}
                {/* 用户名称 */}
                <div
                  className={`text-sm truncate ${
                    seller.storeName
                      ? "text-gray-600"
                      : "font-medium text-gray-800"
                  }`}
                >
                  👤 {seller.userName}
                </div>
                {/* 用户ID */}
                <div className="text-xs text-gray-500 truncate">
                  ID: {seller.userId}
                </div>
                {/* 挂售次数 */}
                <div className="text-sm text-green-600 font-semibold">
                  挂售: {seller.listingCount}次
                </div>
              </div>
              <button
                onClick={(e) => handleViewTrading(seller.userId, e)}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                title="查看交易轨迹"
              >
                <Eye className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
