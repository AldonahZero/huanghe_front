import ItemCard from "@/components/ItemCard";
import { dashboardItems } from "@/lib/dashboardData";
import ProjectsList from "@/components/ProjectsList";

export default function DashboardPage() {
  return (
    <main className="p-6 dashboard-main">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">监控饰品</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((it) => (
          <ItemCard key={it.id} item={it} />
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">我的项目</h3>
        <ProjectsList />
      </div>
    </main>
  );
}
