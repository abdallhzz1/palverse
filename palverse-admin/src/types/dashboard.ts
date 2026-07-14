export type DashboardPeriod = "today" | "last_7_days" | "last_30_days" | "current_month" | "previous_month" | "current_year" | "custom";

export interface DashboardDateRange {
  from?: string;
  to?: string;
  period?: DashboardPeriod | string;
}

export interface DashboardSummaryResponse {
  users: {
    total_users: number;
    suspended_users: number;
    [key: string]: number;
  };
  stores: {
    total_stores: number;
    publicly_visible_stores: number;
    [key: string]: number;
  };
  subscriptions: {
    active_subscriptions: number;
    [key: string]: number;
  };
  offers: {
    active_offers: number;
    [key: string]: number;
  };
  taxonomy: {
    active_categories: number;
    [key: string]: number;
  };
  notifications?: {
    [key: string]: number;
  };
}

export interface DashboardBreakdownItem {
  key: string;
  count: number;
}

export interface DashboardTrendItem {
  period: string; // "YYYY-MM-DD"
  count: number;
}

export interface RecentActivityItem {
  id?: string;
  public_id?: string;
  action: string;
  description: string;
  created_at: string;
  user_name?: string;
  [key: string]: unknown; // Allow flexibility as activity structures vary
}
