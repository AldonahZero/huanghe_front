"use client";
import { SellListing } from "@/types/project";

interface SellListingsSectionProps {
  topSellers: SellListing[];
}

export default function SellListingsSection({
  topSellers,
}: SellListingsSectionProps) {
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
                alt={seller.userName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{seller.userName}</div>
                <div className="text-xs text-gray-500 truncate">
                  ID: {seller.userId}
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  挂售: {seller.listingCount}次
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
