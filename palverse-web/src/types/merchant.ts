export type StoreStatus = "pending" | "approved" | "rejected" | "suspended";

export interface MerchantDashboardSummary {
  stores: {
    total_stores: number;
    pending_stores: number;
    approved_stores: number;
    rejected_stores: number;
    active_stores: number;
    publicly_visible_stores: number;
    stores_needing_subscription: number;
    new_stores_in_period: number;
  };
  subscriptions: {
    active_subscriptions: number;
    expiring_soon_subscriptions: number;
    expired_subscriptions: number;
    cancelled_subscriptions: number;
  };
  offers: {
    total_offers: number;
    active_offers: number;
    currently_valid_offers: number;
    expired_offers: number;
    scheduled_offers: number;
    offers_created_in_period: number;
  };
  notifications: {
    unread_notifications: number;
  };
  action_required: {
    rejected_stores: number;
    stores_without_active_subscription: number;
    subscriptions_expiring_soon: number;
    expired_subscriptions: number;
    stores_missing_logo: number;
    stores_missing_cover: number;
    stores_without_working_hours: number;
    stores_without_social_links: number;
  };
}

export interface RecentActivity {
  id: string;
  type: "store" | "offer" | "subscription" | "notification";
  action: string;
  description_ar: string;
  created_at: string;
}

export interface RecentActivityRaw {
  recent_stores: any[];
  recent_offers: any[];
  recent_subscriptions: any[];
  recent_notifications: any[];
}

export interface StoreCompleteness {
  percentage: number;
  completed: number;
  total: number;
  checks: Record<string, boolean>;
}

export interface StoreReadiness {
  ready: boolean;
  blocking_reasons: string[];
}

export interface StoreDashboardData {
  store_status: {
    public_id: string;
    name_ar: string;
    name_en: string | null;
    approval_status: StoreStatus;
    is_active: boolean;
    is_publicly_visible: boolean;
    rejection_reason: string | null;
    slug: string | null;
    web_url: string | null;
    deep_link: string | null;
  };
  subscription: {
    has_active_subscription: boolean;
    current_subscription: {
      public_id: string;
      plan_name_ar: string | null;
      plan_name_en: string | null;
      ends_at: string;
    } | null;
    days_remaining: number;
    expiring_soon: boolean;
    public_visibility_allowed: boolean;
  };
  offers: {
    total_offers: number;
    active_offers: number;
    currently_valid_offers: number;
    expired_offers: number;
    scheduled_offers: number;
  };
  profile_completion: StoreCompleteness;
  public_readiness: StoreReadiness;
}

export interface MerchantStore {
  public_id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string;
  description_en: string | null;
  slug: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address_ar: string;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  status: StoreStatus;
  is_active: boolean;
  rejection_reason: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  category: {
    public_id: string;
    name_ar: string;
    name_en: string;
    slug: string;
  };
  city: {
    public_id: string;
    name_ar: string;
    name_en: string;
  };
  zone: {
    public_id: string;
    name_ar: string;
    name_en: string;
  };
  logo_url: string | null;
  cover_url: string | null;
}

export interface MerchantOffer {
  public_id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string;
  description_en: string | null;
  price: number;
  old_price: number | null;
  currency: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  public_id: string;
  platform: string;
  url: string;
}

export interface WorkingPeriod {
  start: string;
  end: string;
}

export interface WorkingDay {
  is_closed: boolean;
  periods: WorkingPeriod[];
}

export type WorkingHours = Record<string, WorkingDay>;

export interface MediaItem {
  public_id: string;
  url: string;
  role: string;
  order: number;
}
