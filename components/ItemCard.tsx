"use client";
import { Item } from "../lib/dashboardData";
import { useRouter } from "next/navigation";
import "./ItemCard.css";

export default function ItemCard({ item }: { item: Item }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/project/${item.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4 flex flex-col dashboard-card cursor-pointer transition-transform hover:scale-105"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-xs text-gray-500">{item.wear}</div>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-sm text-gray-500">价格</div>
          <div className="text-xl font-bold">${item.price.toFixed(2)}</div>
        </div>
        <div
          className={`text-sm ${
            item.change24h >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.change24h >= 0 ? `+${item.change24h}%` : `${item.change24h}%`}
        </div>
      </div>
    </div>
  );
}
