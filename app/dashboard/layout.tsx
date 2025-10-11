import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="dashboard-grid">
        <DashboardSidebar />
        <div className="dashboard-content">
          <DashboardTopbar />
          {children}
        </div>
      </div>
    </div>
  );
}
