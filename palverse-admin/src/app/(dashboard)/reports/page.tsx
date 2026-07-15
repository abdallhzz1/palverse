"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminReports } from "@/hooks/use-admin-reports";
import { ReportsFilterState, AnalyticsPeriod, AnalyticsDateRange } from "@/types/analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnalyticsPeriodSelector } from "@/components/analytics/analytics-period-selector";
import { Button } from "@/components/ui/button";
import { RefreshCw, Store, CreditCard, Users, Percent, AlertTriangle } from "lucide-react";
import { AnalyticsBarChart } from "@/components/analytics/charts/analytics-bar-chart";
import { KpiCard } from "@/components/analytics/kpi-card";

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialSection = (searchParams.get("section") || "overview") as ReportsFilterState["section"];
  const initialPeriod = (searchParams.get("period") || "last_30_days") as AnalyticsPeriod;
  const initialDateFrom = searchParams.get("date_from") || undefined;
  const initialDateTo = searchParams.get("date_to") || undefined;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const {
    summary,
    storesByCategory,
    storesByCity,
    subscriptionsByPlan,
    isInitialLoading,
    isRefreshing,
    filters,
    setFilters,
    refresh
  } = useAdminReports({
    section: initialSection,
    period: initialPeriod,
    date_from: initialDateFrom,
    date_to: initialDateTo,
  });

  // Sync state changes to URL
  useEffect(() => {
    if (!isMounted) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", filters.section);
    params.set("period", filters.period);
    
    if (filters.period === "custom" && filters.date_from && filters.date_to) {
      params.set("date_from", filters.date_from);
      params.set("date_to", filters.date_to);
    } else {
      params.delete("date_from");
      params.delete("date_to");
    }

    const newQuery = params.toString();
    if (searchParams.toString() !== newQuery) {
      router.replace(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [filters, isMounted, pathname, router, searchParams]);

  const handleTabChange = (val: string) => {
    setFilters({ ...filters, section: val as ReportsFilterState["section"] });
  };

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setFilters({ ...filters, period });
  };

  const handleDateRangeChange = (range: AnalyticsDateRange) => {
    setFilters({
      ...filters,
      period: (range.period as AnalyticsPeriod) || "custom",
      date_from: range.from,
      date_to: range.to,
    });
  };

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">التقارير التحليلية</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">تقارير تفصيلية لأداء المنصة</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnalyticsPeriodSelector 
            selectedPeriod={filters.period} 
            dateRange={{ period: filters.period, from: filters.date_from, to: filters.date_to }}
            onPeriodChange={handlePeriodChange} 
            onDateRangeChange={handleDateRangeChange}
            disabled={isRefreshing || isInitialLoading} 
          />
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="icon" 
            disabled={isRefreshing || isInitialLoading}
            className="h-9 w-9 border-border dark:border-slate-700 bg-card dark:bg-[#1F2522]"
            aria-label="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs value={filters.section} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start border-b border-border dark:border-slate-800 rounded-none pb-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1E7D4E] data-[state=active]:text-white rounded-full px-6">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="stores" className="data-[state=active]:bg-[#1E7D4E] data-[state=active]:text-white rounded-full px-6">
            المحلات
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#1E7D4E] data-[state=active]:text-white rounded-full px-6">
            الاشتراكات
          </TabsTrigger>
          <TabsTrigger value="offers" className="data-[state=active]:bg-[#1E7D4E] data-[state=active]:text-white rounded-full px-6">
            العروض
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#1E7D4E] data-[state=active]:text-white rounded-full px-6">
            المستخدمون
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="overview" className="m-0 space-y-6">
             {/* Simple summary cards since overview was selected */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard 
                  title="المحلات الجديدة" 
                  value={summary.data?.stores?.new_stores_in_period} 
                  icon={<Store className="w-5 h-5" />} 
                  isLoading={summary.isLoading}
                />
                <KpiCard 
                  title="الاشتراكات الجديدة" 
                  value={summary.data?.subscriptions?.subscriptions_started_in_period} 
                  icon={<CreditCard className="w-5 h-5" />} 
                  isLoading={summary.isLoading}
                />
                <KpiCard 
                  title="المستخدمين الجدد" 
                  value={summary.data?.users?.new_users_in_period} 
                  icon={<Users className="w-5 h-5" />} 
                  isLoading={summary.isLoading}
                />
                <KpiCard 
                  title="العروض الجديدة" 
                  value={summary.data?.offers?.offers_created_in_period} 
                  icon={<Percent className="w-5 h-5" />} 
                  isLoading={summary.isLoading}
                />
             </div>
          </TabsContent>

          <TabsContent value="stores" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground dark:text-white mb-6">توزيع المحلات حسب التصنيف</h3>
                {storesByCategory.error ? (
                  <div className="h-[300px] flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-6 h-6 mr-2" /> خطأ في التحميل
                  </div>
                ) : storesByCategory.isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E7D4E]"></div>
                  </div>
                ) : (
                  <AnalyticsBarChart data={storesByCategory.data || []} metricLabel="محل" color="#1E7D4E" />
                )}
              </div>
              
              <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground dark:text-white mb-6">توزيع المحلات حسب المدينة</h3>
                {storesByCity.error ? (
                  <div className="h-[300px] flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-6 h-6 mr-2" /> خطأ في التحميل
                  </div>
                ) : storesByCity.isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E7D4E]"></div>
                  </div>
                ) : (
                  <AnalyticsBarChart data={storesByCity.data || []} metricLabel="محل" color="#7FA789" />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="m-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <KpiCard 
                title="الاشتراكات المنتهية" 
                value={summary.data?.subscriptions?.expired_subscriptions} 
                icon={<AlertTriangle className="w-5 h-5" />} 
                iconClassName="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="الاشتراكات الملغاة" 
                value={summary.data?.subscriptions?.cancelled_subscriptions} 
                icon={<AlertTriangle className="w-5 h-5" />} 
                iconClassName="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="بدون اشتراك نشط" 
                value={summary.data?.stores?.stores_without_active_subscription} 
                icon={<Store className="w-5 h-5" />} 
                isLoading={summary.isLoading}
              />
            </div>

            <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground dark:text-white mb-6">توزيع الاشتراكات حسب الباقة</h3>
              {subscriptionsByPlan.error ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-6 h-6 mr-2" /> خطأ في التحميل
                </div>
              ) : subscriptionsByPlan.isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E7D4E]"></div>
                </div>
              ) : (
                <AnalyticsBarChart data={subscriptionsByPlan.data || []} metricLabel="اشتراك" color="#0F3D2E" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="offers" className="m-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard 
                title="العروض الصالحة حالياً" 
                value={summary.data?.offers?.currently_valid_offers} 
                icon={<Percent className="w-5 h-5" />} 
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="العروض المجدولة" 
                value={summary.data?.offers?.scheduled_offers} 
                icon={<Percent className="w-5 h-5" />} 
                iconClassName="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="العروض المنتهية" 
                value={summary.data?.offers?.expired_offers} 
                icon={<AlertTriangle className="w-5 h-5" />} 
                iconClassName="bg-muted dark:bg-slate-800 text-muted-foreground dark:text-muted-foreground"
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="العروض المعطلة" 
                value={summary.data?.offers?.inactive_offers} 
                icon={<AlertTriangle className="w-5 h-5" />} 
                iconClassName="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                isLoading={summary.isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="m-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard 
                title="المستخدمين النشطين" 
                value={summary.data?.users?.active_users} 
                icon={<Users className="w-5 h-5" />} 
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="إجمالي التجار" 
                value={summary.data?.users?.total_merchants} 
                icon={<Store className="w-5 h-5" />} 
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="المستخدمين المعطلين" 
                value={summary.data?.users?.inactive_users} 
                icon={<AlertTriangle className="w-5 h-5" />} 
                iconClassName="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                isLoading={summary.isLoading}
              />
              <KpiCard 
                title="المستخدمين الموقوفين" 
                value={summary.data?.users?.suspended_users} 
                icon={<AlertTriangle className="w-5 h-5" />} 
                iconClassName="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                isLoading={summary.isLoading}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
