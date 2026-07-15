"use client";

import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { KpiCard } from "@/components/analytics/kpi-card";
import { AnalyticsPeriodSelector } from "@/components/analytics/analytics-period-selector";
import { AnalyticsLineChart } from "@/components/analytics/charts/analytics-line-chart";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { StoreStatusChart } from "@/components/dashboard/store-status-chart";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Store, MapPin, CreditCard, Percent, Tag, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    dateRange,
    setDateRange,
    refresh,
    activeTrendMetric,
    setActiveTrendMetric,
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

  // Determine label for the active metric chart
  const metricLabelMap: Record<string, string> = {
    stores: "محل",
    subscriptions: "اشتراك",
    offers: "عرض",
    users: "مستخدم",
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">لوحة التحكم</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">نظرة شاملة على أداء منصة Palverse</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnalyticsPeriodSelector 
            selectedPeriod={selectedPeriod} 
            dateRange={dateRange}
            onPeriodChange={setSelectedPeriod} 
            onDateRangeChange={setDateRange}
            disabled={isRefreshing || isInitialLoading} 
          />
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
          <KpiCard 
            title="إجمالي المستخدمين" 
            value={summary.data?.users?.total_users} 
            icon={<Users className="w-5 h-5" />} 
            isLoading={summary.isLoading && !summary.data}
          />
          <KpiCard 
            title="إجمالي المحلات" 
            value={summary.data?.stores?.total_stores} 
            icon={<Store className="w-5 h-5" />} 
            isLoading={summary.isLoading && !summary.data}
          />
          <KpiCard 
            title="محلات قيد المراجعة" 
            value={summary.data?.stores?.pending_stores} 
            icon={<MapPin className="w-5 h-5" />} 
            iconClassName="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
            isLoading={summary.isLoading && !summary.data}
          />
          <KpiCard 
            title="الاشتراكات النشطة" 
            value={summary.data?.subscriptions?.active_subscriptions} 
            icon={<CreditCard className="w-5 h-5" />} 
            isLoading={summary.isLoading && !summary.data}
          />
          <KpiCard 
            title="العروض النشطة" 
            value={summary.data?.offers?.active_offers} 
            icon={<Percent className="w-5 h-5" />} 
            isLoading={summary.isLoading && !summary.data}
          />
          <KpiCard 
            title="المحلات المخفية أو معطلة" 
            value={(summary.data?.stores?.total_stores || 0) - (summary.data?.stores?.publicly_visible_stores || 0)} 
            icon={<AlertTriangle className="w-5 h-5" />}
            iconClassName="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            isLoading={summary.isLoading && !summary.data}
          />
          <KpiCard 
            title="اشتراكات تنتهي قريباً" 
            value={summary.data?.subscriptions?.subscriptions_expiring_soon} 
            icon={<CreditCard className="w-5 h-5" />} 
            iconClassName="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
            isLoading={summary.isLoading && !summary.data}
          />
          <KpiCard 
            title="إشعارات غير مقروءة" 
            value={summary.data?.notifications?.unread_notifications_total} 
            icon={<Tag className="w-5 h-5" />} 
            isLoading={summary.isLoading && !summary.data}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">مؤشرات النمو</h3>
            <Select value={activeTrendMetric} onValueChange={(val: any) => setActiveTrendMetric(val)}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="اختر المؤشر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stores">المحلات</SelectItem>
                <SelectItem value="users">المستخدمين</SelectItem>
                <SelectItem value="subscriptions">الاشتراكات</SelectItem>
                <SelectItem value="offers">العروض</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {trends.error ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 mb-2 opacity-50 text-red-500" />
              <span>تعذر تحميل الرسوم البيانية</span>
            </div>
          ) : trends.isLoading && !trends.data ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E7D4E]"></div>
            </div>
          ) : (
            <AnalyticsLineChart 
              data={trends.data || []} 
              metricLabel={metricLabelMap[activeTrendMetric]} 
            />
          )}
        </div>

        {/* Store Status Breakdown */}
        <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">حالة المحلات</h3>
          {storesByStatus.error ? (
             <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
               <AlertTriangle className="w-6 h-6 mb-2 opacity-50 text-red-500" />
               <span>تعذر تحميل المخطط</span>
             </div>
          ) : storesByStatus.isLoading && !storesByStatus.data ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E7D4E]"></div>
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
          <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            تعذر تحميل أحدث الأنشطة
          </div>
        ) : recentActivity.isLoading && !recentActivity.data ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RecentActivityList items={recentActivity.data || []} />
        )}
      </div>
    </div>
  );
}
