export default function DashboardTopbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/70 backdrop-blur border-b">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-gray-100">☰</button>
        <h4 className="text-lg font-semibold">概览</h4>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">管理员</div>
      </div>
    </header>
  );
}
