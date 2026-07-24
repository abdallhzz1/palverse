export type FollowUpStoreStatus = "pending" | "approved" | "rejected";

export interface StoreMediaItem {
  public_id: string;
  type: string;
  url: string;
  original_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  sort_order?: number | null;
  alt_text_ar?: string | null;
  alt_text_en?: string | null;
  created_at?: string | null;
}

export interface FollowUpStoreSocialLink {
  public_id: string;
  platform: string;
  url: string;
  username?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface FollowUpWorkingPeriod {
  public_id?: string;
  opens_at: string;
  closes_at: string;
}

export interface FollowUpWorkingHoursDay {
  day_of_week: number;
  day_label_ar: string;
  day_label_en: string;
  is_closed: boolean;
  periods: FollowUpWorkingPeriod[];
}

export interface FollowUpStoreOffer {
  public_id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number | null;
  old_price: number | null;
  currency: string;
  discount_percentage: number | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_currently_valid: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUpStore {
  public_id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string;
  description_en: string | null;
  slug: string | null;
  web_url?: string | null;
  deep_link?: string | null;
  qr_url?: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address_ar: string;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  status: FollowUpStoreStatus;
  is_active: boolean;
  has_active_subscription?: boolean;
  is_publicly_visible?: boolean;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason?: string | null;
  owner?: { public_id: string; name: string; email: string } | null;
  category: { public_id: string; name_ar: string; name_en: string; slug?: string } | null;
  city: { public_id: string; name_ar: string; name_en: string } | null;
  zone: { public_id: string; name_ar: string; name_en: string } | null;
  created_at: string;
  updated_at: string;
  logo: StoreMediaItem | null;
  cover: StoreMediaItem | null;
  gallery?: StoreMediaItem[];
  working_hours?: FollowUpWorkingHoursDay[];
  social_links?: FollowUpStoreSocialLink[];
}

export interface FollowUpPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface FollowUpPaginatedData<T> {
  data: T[];
  meta: FollowUpPaginationMeta | null;
}
