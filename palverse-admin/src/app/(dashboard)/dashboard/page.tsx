"use client";

import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardPeriodSelector } from "@/components/dashboard/dashboard-period-selector";
import { StoreStatusChart } from "@/components/dashboard/store-status-chart";
import { DashboardTrendChart } from "@/components/dashboard/dashboard-trend-chart";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Store, MapPin, CreditCard, Percent, Tag, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const {
    summary,
    storesByStatus,
    trends,
    recentActivity,
    isInitialLoading,
    isRefreshing,
    hasAnyData,
    selectedPeriod,
    setSelectedPeriod,
    refresh
  } = useAdminDashboard();

  if (isInitialLoading && !hasAnyData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">لوحة التحكم</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">نظرة شاملة على أداء منصة Palverse</p>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // Calculate some derived stats safely
  const pendingStores = Array.isArray(storesByStatus.data) 
    ? storesByStatus.data.find(s => s.key === "pending")?.count || 0 
    : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">لوحة التحكم</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">نظرة شاملة على أداء منصة Palverse</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* We must handle the type conversion carefully for DashboardPeriodSelector */}
          <DashboardPeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} disabled={isRefreshing || isInitialLoading} />
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="icon" 
            disabled={isRefreshing || isInitialLoading}
            className="h-9 w-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2522]"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      {summary.error ? (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
          <p className="text-red-700 dark:text-red-400 font-medium">{summary.error.message || "تعذر تحميل بيانات لوحة التحكم الأساسية"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="إجمالي المستخدمين" 
            value={summary.data?.users?.total_users} 
            icon={<Users />} 
          />
          <StatCard 
            title="إجمالي المحلات" 
            value={summary.data?.stores?.total_stores} 
            icon={<Store />} 
          />
          <StatCard 
            title="محلات قيد المراجعة" 
            value={pendingStores} 
            icon={<MapPin />} 
          />
          <StatCard 
            title="الاشتراكات النشطة" 
            value={summary.data?.subscriptions?.active_subscriptions} 
            icon={<CreditCard />} 
          />
          <StatCard 
            title="العروض النشطة" 
            value={summary.data?.offers?.active_offers} 
            icon={<Percent />} 
          />
          <StatCard 
            title="التصنيفات النشطة" 
            value={summary.data?.taxonomy?.active_categories} 
            icon={<Tag />} 
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">نمو المحلات</h3>
          {trends.error ? (
            <div className="h-[350px] flex flex-col items-center justify-center text-slate-400">
              <AlertTriangle className="w-6 h-6 mb-2 opacity-50" />
              <span>تعذر تحميل الرسوم البيانية</span>
            </div>
          ) : (
            <DashboardTrendChart data={trends.data || []} metricLabel="محل" />
          )}
        </div>

        {/* Store Status Breakdown */}
        <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">حالة المحلات</h3>
          {storesByStatus.error ? (
             <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
               <AlertTriangle className="w-6 h-6 mb-2 opacity-50" />
               <span>تعذر تحميل المخطط</span>
             </div>
          ) : (
            <StoreStatusChart data={storesByStatus.data || []} />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">أحدث الأنشطة</h3>
        {recentActivity.error ? (
          <div className="p-4 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            تعذر تحميل أحدث الأنشطة
          </div>
        ) : (
          <RecentActivityList items={recentActivity.data || []} />
        )}
      </div>
    </div>
  );
}
