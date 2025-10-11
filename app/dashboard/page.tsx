import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import ItemCard from "@/components/ItemCard";
import { dashboardItems } from "@/lib/dashboardData";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="dashboard-grid">
        <DashboardSidebar />
        <div className="dashboard-content">
          <DashboardTopbar />
          <main className="p-6 dashboard-main">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">监控饰品</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardItems.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
