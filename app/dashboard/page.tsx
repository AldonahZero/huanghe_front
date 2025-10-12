import ItemCard from "@/components/ItemCard";
import { dashboardItems } from "@/lib/dashboardData";
import MonitoredItemsGrid from "@/components/MonitoredItemsGrid";
import ProjectsList from "@/components/ProjectsList";

export default function DashboardPage() {
  return (
    <main className="p-6 dashboard-main">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">监控饰品</h2>
      </div>

      <MonitoredItemsGrid />
    </main>
  );
}
