"use client";

import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { useAuth } from "@/providers/auth-provider";
import { AnalyticsPeriodSelector } from "@/components/analytics/analytics-period-selector";
import { AnalyticsLineChart } from "@/components/analytics/charts/analytics-line-chart";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { StoreStatusChart } from "@/components/dashboard/store-status-chart";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Users,
  Store,
  CreditCard,
  Percent,
  AlertTriangle,
  Banknote,
  Bell,
  ShieldCheck,
  FileX,
  TrendingUp,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const metricLabelMap: Record<string, string> = {
  stores: "محل",
  subscriptions: "اشتراك",
  offers: "عرض",
  users: "مستخدم",
};

const trendMetricOptions = [
  { value: "stores", label: "المحلات" },
  { value: "users", label: "المستخدمين" },
  { value: "subscriptions", label: "الاشتراكات" },
  { value: "offers", label: "العروض" },
] as const;

function ChartLoadingState() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1E7D4E] border-t-transparent" />
    </div>
  );
}

function ChartErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/50 text-muted-foreground dark:border-red-900/30 dark:bg-red-900/10">
      <AlertTriangle className="mb-2 h-6 w-6 text-red-500" />
      <span>{message}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
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
      <div className="space-y-8">
        <DashboardHero userName={user?.name} />
        <DashboardSkeleton />
      </div>
    );
  }

  const summaryData = summary.data;
  const isSummaryLoading = summary.isLoading && !summary.data;

  return (
    <div className="space-y-8 pb-8">
      <DashboardHero userName={user?.name}>
        <AnalyticsPeriodSelector
          selectedPeriod={selectedPeriod}
          dateRange={dateRange}
          onPeriodChange={setSelectedPeriod}
          onDateRangeChange={setDateRange}
          disabled={isRefreshing || isInitialLoading}
        />
        <Button
          onClick={refresh}
          variant="secondary"
          size="icon"
          disabled={isRefreshing || isInitialLoading}
          className="h-10 w-10 border border-white/20 bg-white/10 text-white hover:bg-white/20"
          aria-label="تحديث البيانات"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </DashboardHero>

      <DashboardQuickActions />

      {summary.error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-900/10">
          <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
          <p className="font-medium text-red-700 dark:text-red-400">
            {summary.error.message || "تعذر تحميل بيانات لوحة التحكم الأساسية"}
          </p>
        </div>
      ) : (
        <>
          <DashboardSection
            title="المؤشرات الرئيسية"
            description="أهم أرقام المنصة في لمحة سريعة"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardStatCard
                title="إجمالي المستخدمين"
                value={summaryData?.users?.total_users}
                icon={<Users className="h-5 w-5" />}
                variant="featured"
                periodValue={summaryData?.users?.new_users_in_period}
                isLoading={isSummaryLoading}
                href="/users"
              />
              <DashboardStatCard
                title="إجمالي المحلات"
                value={summaryData?.stores?.total_stores}
                icon={<Store className="h-5 w-5" />}
                variant="featured"
                periodValue={summaryData?.stores?.new_stores_in_period}
                isLoading={isSummaryLoading}
                href="/stores"
              />
              <DashboardStatCard
                title="الاشتراكات النشطة"
                value={summaryData?.subscriptions?.active_subscriptions}
                icon={<CreditCard className="h-5 w-5" />}
                variant="featured"
                periodValue={summaryData?.subscriptions?.subscriptions_started_in_period}
                periodLabel="اشتراك جديد"
                isLoading={isSummaryLoading}
                href="/subscriptions"
              />
              <DashboardStatCard
                title="العروض النشطة"
                value={summaryData?.offers?.active_offers}
                icon={<Percent className="h-5 w-5" />}
                variant="featured"
                periodValue={summaryData?.offers?.offers_created_in_period}
                periodLabel="عرض جديد"
                isLoading={isSummaryLoading}
                href="/offers"
              />
            </div>
          </DashboardSection>

          <DashboardSection
            title="متابعة العمليات"
            description="مؤشرات تحتاج انتباهك اليوم"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardStatCard
                title="محلات قيد المراجعة"
                value={summaryData?.stores?.pending_stores}
                icon={<Store className="h-5 w-5" />}
                variant="warning"
                isLoading={isSummaryLoading}
                href="/stores"
              />
              <DashboardStatCard
                title="اشتراكات تنتهي قريباً"
                value={summaryData?.subscriptions?.subscriptions_expiring_soon}
                icon={<CreditCard className="h-5 w-5" />}
                variant="warning"
                isLoading={isSummaryLoading}
                href="/subscriptions"
              />
              <DashboardStatCard
                title="محلات مخفية أو معطلة"
                value={
                  (summaryData?.stores?.total_stores || 0) -
                  (summaryData?.stores?.publicly_visible_stores || 0)
                }
                icon={<AlertTriangle className="h-5 w-5" />}
                variant="danger"
                isLoading={isSummaryLoading}
                href="/stores"
              />
              <DashboardStatCard
                title="إشعارات غير مقروءة"
                value={summaryData?.notifications?.unread_notifications_total}
                icon={<Bell className="h-5 w-5" />}
                isLoading={isSummaryLoading}
                href="/notifications"
              />
            </div>
          </DashboardSection>

          {summaryData?.field_sales && (
            <DashboardSection
              title="المبيعات الميدانية"
              description="أداء المناديب والتحصيل والعمولات"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardStatCard
                  title="إجمالي المناديب"
                  value={summaryData.field_sales.total_representatives}
                  icon={<ShieldCheck className="h-5 w-5" />}
                  isLoading={summary.isLoading}
                  href="/representatives"
                />
                <DashboardStatCard
                  title="سندات القبض (محصلة)"
                  value={`₪${summaryData.field_sales.total_receipts_amount || 0}`}
                  icon={<Banknote className="h-5 w-5" />}
                  variant="success"
                  isLoading={summary.isLoading}
                  href="/receipts"
                />
                <DashboardStatCard
                  title="تقارير الرفض"
                  value={summaryData.field_sales.total_rejection_reports}
                  icon={<FileX className="h-5 w-5" />}
                  variant="danger"
                  isLoading={summary.isLoading}
                  href="/rejection-reports"
                />
                <DashboardStatCard
                  title="عمولات معلقة"
                  value={`₪${summaryData.field_sales.unpaid_commissions_amount || 0}`}
                  icon={<CreditCard className="h-5 w-5" />}
                  variant="warning"
                  isLoading={summary.isLoading}
                  href="/commissions"
                />
              </div>
            </DashboardSection>
          )}
        </>
      )}

      <DashboardSection title="التحليلات والرسوم البيانية">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardPanel
            className="lg:col-span-2"
            title="مؤشرات النمو"
            description="تتبع التغيرات عبر الزمن"
            action={
              <Select
                value={activeTrendMetric}
                onValueChange={(val) =>
                  setActiveTrendMetric(val as typeof activeTrendMetric)
                }
              >
                <SelectTrigger className="h-9 w-[150px] text-sm">
                  <SelectValue placeholder="اختر المؤشر" />
                </SelectTrigger>
                <SelectContent>
                  {trendMetricOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          >
            {trends.error ? (
              <ChartErrorState message="تعذر تحميل الرسوم البيانية" />
            ) : trends.isLoading && !trends.data ? (
              <ChartLoadingState />
            ) : (
              <AnalyticsLineChart
                data={trends.data || []}
                metricLabel={metricLabelMap[activeTrendMetric]}
              />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="حالة المحلات"
            description="توزيع المحلات حسب الحالة"
            action={
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                نظرة عامة
              </div>
            }
          >
            {storesByStatus.error ? (
              <ChartErrorState message="تعذر تحميل المخطط" />
            ) : storesByStatus.isLoading && !storesByStatus.data ? (
              <ChartLoadingState />
            ) : (
              <StoreStatusChart data={storesByStatus.data || []} />
            )}
          </DashboardPanel>
        </div>
      </DashboardSection>

      <DashboardPanel
        title="أحدث الأنشطة"
        description="آخر العمليات التي تمت على المنصة"
      >
        {recentActivity.error ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            تعذر تحميل أحدث الأنشطة
          </div>
        ) : recentActivity.isLoading && !recentActivity.data ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RecentActivityList items={recentActivity.data || []} />
        )}
      </DashboardPanel>
    </div>
  );
}
