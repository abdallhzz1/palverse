import { useState, useCallback, useEffect, useRef } from "react";
import { analyticsService } from "@/services/analytics.service";
import {
  DashboardBreakdownItem,
  AnalyticsDateRange,
  ReportsFilterState,
  DashboardSummaryResponse,
} from "@/types/analytics";
import { NormalizedApiError } from "@/lib/api/error";
import { SectionState } from "./use-admin-dashboard";

interface UseAdminReportsReturn {
  summary: SectionState<DashboardSummaryResponse>;
  storesByCategory: SectionState<DashboardBreakdownItem[]>;
  storesByCity: SectionState<DashboardBreakdownItem[]>;
  subscriptionsByPlan: SectionState<DashboardBreakdownItem[]>;
  
  isInitialLoading: boolean;
  isRefreshing: boolean;
  
  filters: ReportsFilterState;
  setFilters: (filters: ReportsFilterState) => void;
  dateRange: AnalyticsDateRange;
  setDateRange: (range: AnalyticsDateRange) => void;
  refresh: () => Promise<void>;
}

const initialSectionState = {
  data: null,
  isLoading: true,
  error: null,
};

export function useAdminReports(initialFilters: ReportsFilterState): UseAdminReportsReturn {
  const [filters, setFilters] = useState<ReportsFilterState>(initialFilters);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({ 
    period: initialFilters.period,
    from: initialFilters.date_from,
    to: initialFilters.date_to,
  });

  const [summary, setSummary] = useState<SectionState<DashboardSummaryResponse>>(initialSectionState);
  const [storesByCategory, setStoresByCategory] = useState<SectionState<DashboardBreakdownItem[]>>(initialSectionState);
  const [storesByCity, setStoresByCity] = useState<SectionState<DashboardBreakdownItem[]>>(initialSectionState);
  const [subscriptionsByPlan, setSubscriptionsByPlan] = useState<SectionState<DashboardBreakdownItem[]>>(initialSectionState);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Update dateRange when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (filters.period === "custom") {
      setDateRange({ period: "custom", from: filters.date_from, to: filters.date_to });
    } else {
      setDateRange({ period: filters.period });
    }
  }, [filters]);

  const fetchReportsData = useCallback(async (isSilentRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (!isSilentRefresh) {
      setIsInitialLoading(true);
      setSummary(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (filters.section === "stores") {
        setStoresByCategory(prev => ({ ...prev, isLoading: true, error: null }));
        setStoresByCity(prev => ({ ...prev, isLoading: true, error: null }));
      }
      if (filters.section === "subscriptions") {
        setSubscriptionsByPlan(prev => ({ ...prev, isLoading: true, error: null }));
      }
    } else {
      setIsRefreshing(true);
    }

    try {
      // Base requests (always need summary for overall metrics in reports)
      const requests: Promise<any>[] = [analyticsService.getSummary(dateRange)];
      
      // Conditional requests based on section to avoid over-fetching
      if (filters.section === "stores") {
        requests.push(
          analyticsService.getStoresByCategory({ ...dateRange, limit: 15 }),
          analyticsService.getStoresByCity({ ...dateRange, limit: 15 })
        );
      } else if (filters.section === "subscriptions") {
        requests.push(analyticsService.getSubscriptionsByPlan({ ...dateRange, limit: 15 }));
      }

      const results = await Promise.allSettled(requests);

      if (abortController.signal.aborted) return;

      // Handle Summary
      const summaryReq = results[0];
      if (summaryReq.status === "fulfilled") {
        setSummary({ data: summaryReq.value, isLoading: false, error: null });
      } else {
        setSummary(prev => ({ ...prev, isLoading: false, error: summaryReq.reason as NormalizedApiError }));
      }

      // Handle Stores section specific data
      if (filters.section === "stores" && results.length >= 3) {
        const catReq = results[1];
        const cityReq = results[2];
        
        if (catReq.status === "fulfilled") setStoresByCategory({ data: catReq.value, isLoading: false, error: null });
        else setStoresByCategory(prev => ({ ...prev, isLoading: false, error: catReq.reason as NormalizedApiError }));
        
        if (cityReq.status === "fulfilled") setStoresByCity({ data: cityReq.value, isLoading: false, error: null });
        else setStoresByCity(prev => ({ ...prev, isLoading: false, error: cityReq.reason as NormalizedApiError }));
      }

      // Handle Subscriptions section specific data
      if (filters.section === "subscriptions" && results.length >= 2) {
        const planReq = results[1];
        
        if (planReq.status === "fulfilled") setSubscriptionsByPlan({ data: planReq.value, isLoading: false, error: null });
        else setSubscriptionsByPlan(prev => ({ ...prev, isLoading: false, error: planReq.reason as NormalizedApiError }));
      }

    } finally {
      if (!abortController.signal.aborted) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [dateRange, filters.section]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchReportsData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchReportsData]);

  const refresh = async () => {
    await fetchReportsData(true);
  };

  return {
    summary,
    storesByCategory,
    storesByCity,
    subscriptionsByPlan,
    isInitialLoading,
    isRefreshing,
    filters,
    setFilters,
    dateRange,
    setDateRange,
    refresh,
  };
}
