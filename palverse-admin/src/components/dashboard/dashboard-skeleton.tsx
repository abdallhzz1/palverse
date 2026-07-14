import { StatCard } from "./stat-card";
import { LayoutDashboard } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="جارٍ التحميل" value={0} icon={<LayoutDashboard />} isLoading />
        <StatCard title="جارٍ التحميل" value={0} icon={<LayoutDashboard />} isLoading />
        <StatCard title="جارٍ التحميل" value={0} icon={<LayoutDashboard />} isLoading />
        <StatCard title="جارٍ التحميل" value={0} icon={<LayoutDashboard />} isLoading />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 h-[400px]"></div>
        <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 h-[400px]"></div>
      </div>
    </div>
  );
}
