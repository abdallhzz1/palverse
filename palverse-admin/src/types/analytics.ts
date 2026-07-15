export type AnalyticsPeriod = "today" | "last_7_days" | "last_30_days" | "current_month" | "previous_month" | "current_year" | "custom";
export type AnalyticsInterval = "day" | "week" | "month";

export interface AnalyticsDateRange {
  period?: AnalyticsPeriod | string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface DashboardSummaryResponse {
  users: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    suspended_users: number;
    total_merchants: number;
    new_users_in_period: number;
  };
  stores: {
    total_stores: number;
    pending_stores: number;
    approved_stores: number;
    rejected_stores: number;
    active_stores: number;
    inactive_stores: number;
    publicly_visible_stores: number;
    stores_without_active_subscription: number;
    new_stores_in_period: number;
  };
  subscriptions: {
    total_subscriptions: number;
    active_subscriptions: number;
    pending_subscriptions: number;
    expired_subscriptions: number;
    cancelled_subscriptions: number;
    subscriptions_expiring_soon: number;
    subscriptions_started_in_period: number;
    subscriptions_ended_in_period: number;
  };
  offers: {
    total_offers: number;
    active_offers: number;
    inactive_offers: number;
    currently_valid_offers: number;
    expired_offers: number;
    scheduled_offers: number;
    offers_created_in_period: number;
  };
  taxonomy: {
    active_categories: number;
    active_cities: number;
    active_zones: number;
  };
  notifications: {
    total_notifications_in_period: number;
    unread_notifications_total: number;
    notifications_sent_in_period: number;
  };
}

export interface DashboardBreakdownItem {
  key: string;
  label_ar: string;
  label_en: string;
  count: number;
}

export interface DashboardTrendItem {
  period: string; // YYYY-MM-DD, YYYY-Www, or YYYY-MM
  count: number;
}

export interface RecentActivityItem {
  public_id: string;
  action: string;
  description: string;
  created_at: string;
  user_name?: string;
}

export interface ReportsFilterState {
  section: "overview" | "stores" | "subscriptions" | "offers" | "users";
  period: AnalyticsPeriod;
  date_from?: string;
  date_to?: string;
}
