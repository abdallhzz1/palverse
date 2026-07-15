import { useState, useCallback, useEffect, useRef } from "react";
import { analyticsService } from "@/services/analytics.service";
import {
  DashboardSummaryResponse,
  DashboardBreakdownItem,
  DashboardTrendItem,
  RecentActivityItem,
  AnalyticsPeriod,
  AnalyticsDateRange,
  AnalyticsInterval,
} from "@/types/analytics";
import { NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export type SectionState<T> = {
  data: T | null;
  isLoading: boolean;
  error: NormalizedApiError | null;
};

interface UseAdminDashboardReturn {
  summary: SectionState<DashboardSummaryResponse>;
  recentActivity: SectionState<RecentActivityItem[]>;
  storesByStatus: SectionState<DashboardBreakdownItem[]>;
  trends: SectionState<DashboardTrendItem[]>;
  
  isInitialLoading: boolean;
  isRefreshing: boolean;
  hasAnyData: boolean;
  
  selectedPeriod: AnalyticsPeriod;
  setSelectedPeriod: (period: AnalyticsPeriod) => void;
  dateRange: AnalyticsDateRange;
  setDateRange: (range: AnalyticsDateRange) => void;
  refresh: () => Promise<void>;
  
  // Trend chart specific
  activeTrendMetric: "stores" | "subscriptions" | "offers" | "users";
  setActiveTrendMetric: (metric: "stores" | "subscriptions" | "offers" | "users") => void;
}

const initialSectionState = {
  data: null,
  isLoading: true,
  error: null,
};

function getIntervalFromPeriod(period?: string, from?: string, to?: string): AnalyticsInterval {
  if (period === "today" || period === "last_7_days" || period === "last_30_days" || period === "current_month" || period === "previous_month") {
    return "day";
  }
  if (period === "current_year") {
    return "month";
  }
  if (period === "custom" && from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) return "month";
    if (diffDays > 31) return "week";
    return "day";
  }
  return "day";
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [summary, setSummary] = useState<SectionState<DashboardSummaryResponse>>(initialSectionState);
  const [recentActivity, setRecentActivity] = useState<SectionState<RecentActivityItem[]>>(initialSectionState);
  const [storesByStatus, setStoresByStatus] = useState<SectionState<DashboardBreakdownItem[]>>(initialSectionState);
  const [trends, setTrends] = useState<SectionState<DashboardTrendItem[]>>(initialSectionState);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>("last_30_days");
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({ period: "last_30_days" });
  
  const [activeTrendMetric, setActiveTrendMetric] = useState<"stores" | "subscriptions" | "offers" | "users">("stores");

  const abortControllerRef = useRef<AbortController | null>(null);

  // Update dateRange when selectedPeriod changes (except for custom which is handled separately)
  useEffect(() => {
    if (selectedPeriod === "custom") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateRange({ period: selectedPeriod });
  }, [selectedPeriod]);

  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (!isSilentRefresh) {
      setIsInitialLoading(true);
      setSummary(prev => ({ ...prev, isLoading: true, error: null }));
      setRecentActivity(prev => ({ ...prev, isLoading: true, error: null }));
      setStoresByStatus(prev => ({ ...prev, isLoading: true, error: null }));
      setTrends(prev => ({ ...prev, isLoading: true, error: null }));
    } else {
      setIsRefreshing(true);
    }

    try {
      const interval = getIntervalFromPeriod(dateRange.period, dateRange.from, dateRange.to);
      const [summaryReq, activityReq, statusReq, trendsReq] = await Promise.allSettled([
        analyticsService.getSummary(dateRange),
        analyticsService.getRecentActivity(10),
        analyticsService.getStoresByStatus(dateRange),
        analyticsService.getTrends(activeTrendMetric, interval, dateRange)
      ]);

      if (abortController.signal.aborted) return;

      // Process Summary
      if (summaryReq.status === "fulfilled") {
        setSummary({ data: summaryReq.value, isLoading: false, error: null });
      } else {
        setSummary(prev => ({ ...prev, isLoading: false, error: summaryReq.reason as NormalizedApiError }));
      }

      // Process Recent Activity
      if (activityReq.status === "fulfilled") {
        setRecentActivity({ data: activityReq.value, isLoading: false, error: null });
      } else {
        setRecentActivity(prev => ({ ...prev, isLoading: false, error: activityReq.reason as NormalizedApiError }));
      }

      // Process Stores by Status
      if (statusReq.status === "fulfilled") {
        setStoresByStatus({ data: statusReq.value, isLoading: false, error: null });
      } else {
        setStoresByStatus(prev => ({ ...prev, isLoading: false, error: statusReq.reason as NormalizedApiError }));
      }

      // Process Trends
      if (trendsReq.status === "fulfilled") {
        setTrends({ data: trendsReq.value, isLoading: false, error: null });
      } else {
        setTrends(prev => ({ ...prev, isLoading: false, error: trendsReq.reason as NormalizedApiError }));
      }

      if (isSilentRefresh) {
        toast.success("تم تحديث البيانات");
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [dateRange, activeTrendMetric]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboardData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDashboardData]);

  const refresh = async () => {
    await fetchDashboardData(true);
  };

  const hasAnyData = !!(summary.data || recentActivity.data || storesByStatus.data || trends.data);

  return {
    summary,
    recentActivity,
    storesByStatus,
    trends,
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
  };
}
