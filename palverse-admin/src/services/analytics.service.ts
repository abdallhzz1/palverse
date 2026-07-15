/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/api/client";
import {
  DashboardSummaryResponse,
  DashboardBreakdownItem,
  DashboardTrendItem,
  RecentActivityItem,
  AnalyticsDateRange,
  AnalyticsInterval,
} from "@/types/analytics";
import { ApiSuccessResponse } from "@/types/api";

export const analyticsService = {
  getSummary: async (params?: AnalyticsDateRange): Promise<DashboardSummaryResponse> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<DashboardSummaryResponse>>(
      "/admin/dashboard/summary",
      { params }
    );
    return response.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivityItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<Record<string, any[]>>>(
      "/admin/dashboard/recent-activity",
      { params: { limit } }
    );
    
    const activityItems: RecentActivityItem[] = [];
    const rawData = response.data || {};

    if (rawData.recent_stores) {
      rawData.recent_stores.forEach((item: any) => {
        activityItems.push({
          public_id: item.public_id,
          action: "محل جديد",
          description: `تم إضافة محل ${item.name_ar}`,
          created_at: item.created_at,
          user_name: item.owner_name,
        });
      });
    }

    if (rawData.recent_pending_stores) {
      rawData.recent_pending_stores.forEach((item: any) => {
        activityItems.push({
          public_id: item.public_id,
          action: "بانتظار المراجعة",
          description: `المحل ${item.name_ar} بانتظار المراجعة`,
          created_at: item.created_at,
          user_name: item.owner_name,
        });
      });
    }

    if (rawData.recent_subscription_assignments) {
      rawData.recent_subscription_assignments.forEach((item: any) => {
        activityItems.push({
          public_id: item.public_id,
          action: "تعيين اشتراك",
          description: `تم تعيين باقة ${item.plan_name} لمحل ${item.store_name}`,
          created_at: item.created_at,
          user_name: item.assigned_by,
        });
      });
    }

    if (rawData.recent_subscription_cancellations) {
      rawData.recent_subscription_cancellations.forEach((item: any) => {
        activityItems.push({
          public_id: item.public_id,
          action: "إلغاء اشتراك",
          description: `تم إلغاء باقة ${item.plan_name} لمحل ${item.store_name}`,
          created_at: item.cancelled_at || item.created_at || new Date().toISOString(),
          user_name: item.cancelled_by,
        });
      });
    }

    if (rawData.recent_offers) {
      rawData.recent_offers.forEach((item: any) => {
        activityItems.push({
          public_id: item.public_id,
          action: "عرض جديد",
          description: `تمت إضافة عرض ${item.title_ar} لمحل ${item.store_name}`,
          created_at: item.created_at,
        });
      });
    }

    if (rawData.recently_expired_subscriptions) {
      rawData.recently_expired_subscriptions.forEach((item: any) => {
        activityItems.push({
          public_id: item.public_id,
          action: "انتهاء اشتراك",
          description: `انتهى اشتراك باقة ${item.plan_name} لمحل ${item.store_name}`,
          created_at: item.ends_at || new Date().toISOString(),
        });
      });
    }

    // Sort by most recent first
    return activityItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  },

  getStoresByStatus: async (params?: AnalyticsDateRange): Promise<DashboardBreakdownItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<DashboardBreakdownItem[]>>(
      "/admin/dashboard/stores-by-status",
      { params }
    );
    return response.data;
  },

  getSubscriptionsByStatus: async (params?: AnalyticsDateRange): Promise<DashboardBreakdownItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<DashboardBreakdownItem[]>>(
      "/admin/dashboard/subscriptions-by-status",
      { params }
    );
    return response.data;
  },

  getStoresByCategory: async (
    params?: AnalyticsDateRange & { limit?: number }
  ): Promise<DashboardBreakdownItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<DashboardBreakdownItem[]>>(
      "/admin/dashboard/stores-by-category",
      { params }
    );
    return response.data;
  },

  getStoresByCity: async (
    params?: AnalyticsDateRange & { limit?: number }
  ): Promise<DashboardBreakdownItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<DashboardBreakdownItem[]>>(
      "/admin/dashboard/stores-by-city",
      { params }
    );
    return response.data;
  },

  getSubscriptionsByPlan: async (
    params?: AnalyticsDateRange & { limit?: number }
  ): Promise<DashboardBreakdownItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<DashboardBreakdownItem[]>>(
      "/admin/dashboard/subscriptions-by-plan",
      { params }
    );
    return response.data;
  },

  getTrends: async (
    metric: "stores" | "subscriptions" | "offers" | "users",
    grouping: AnalyticsInterval,
    params?: AnalyticsDateRange
  ): Promise<DashboardTrendItem[]> => {
    const response = await apiClient.get<unknown, ApiSuccessResponse<DashboardTrendItem[]>>(
      "/admin/dashboard/trends",
      { params: { ...params, metric, grouping } }
    );
    return response.data;
  },
};
