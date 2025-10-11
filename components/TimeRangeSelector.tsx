"use client";

interface TimeRangeSelectorProps {
  value: number;
  onChange: (hours: number) => void;
}

const timeRangeOptions = [
  { label: "最近1小时", value: 1 },
  { label: "最近6小时", value: 6 },
  { label: "最近12小时", value: 12 },
  { label: "最近24小时", value: 24 },
  { label: "最近48小时", value: 48 },
  { label: "最近72小时", value: 72 },
];

export default function TimeRangeSelector({
  value,
  onChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        时间范围选择
      </label>
      <div className="flex flex-wrap gap-2">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded font-medium transition-all ${
              value === option.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        当前显示过去 <span className="font-semibold">{value}</span> 小时的数据
      </div>
    </div>
  );
}
