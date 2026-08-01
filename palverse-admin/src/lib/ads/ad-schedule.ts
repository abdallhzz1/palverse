/** Format YYYY-MM-DD in local timezone. */
export function toDateInputValue(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultAdDateRange(days = 30): { start_date: string; end_date: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return {
    start_date: toDateInputValue(start),
    end_date: toDateInputValue(end),
  };
}

export type AdScheduleStatus = "live" | "scheduled" | "expired" | "paused";

export type BannerPlacementId = "home_hero" | "home_mid" | "stores_list" | "store_sidebar";

export type BannerPlacementOption = {
  id: BannerPlacementId;
  label_ar: string;
  aspect_ratio: string;
  recommended_size: string;
  ui_variant: "hero" | "inline" | "sidebar";
  max_concurrent: number;
};

/** Canonical banner slots — keep in sync with App\Enums\AdPlacement */
export const BANNER_PLACEMENTS: BannerPlacementOption[] = [
  {
    id: "home_hero",
    label_ar: "بنر الرئيسية (تحت البحث)",
    aspect_ratio: "21:9",
    recommended_size: "1400×600",
    ui_variant: "hero",
    max_concurrent: 5,
  },
  {
    id: "home_mid",
    label_ar: "بنر وسط الرئيسية",
    aspect_ratio: "21:8",
    recommended_size: "1200×460",
    ui_variant: "inline",
    max_concurrent: 5,
  },
  {
    id: "stores_list",
    label_ar: "بنر صفحة المتاجر",
    aspect_ratio: "21:8",
    recommended_size: "1200×460",
    ui_variant: "inline",
    max_concurrent: 5,
  },
  {
    id: "store_sidebar",
    label_ar: "بنر جانبي في بروفايل المحل",
    aspect_ratio: "4:5",
    recommended_size: "800×1000",
    ui_variant: "sidebar",
    max_concurrent: 3,
  },
];

export function getBannerPlacement(id?: string | null): BannerPlacementOption | undefined {
  return BANNER_PLACEMENTS.find((p) => p.id === id);
}

export function getAdScheduleStatus(ad: {
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}): AdScheduleStatus {
  if (!ad.is_active) return "paused";

  const today = toDateInputValue();
  const start = (ad.start_date || "").slice(0, 10);
  const end = (ad.end_date || "").slice(0, 10);

  if (start && start > today) return "scheduled";
  if (end && end < today) return "expired";
  return "live";
}

export function adScheduleLabel(status: AdScheduleStatus): { label: string; className: string } {
  switch (status) {
    case "live":
      return { label: "منشور على الموقع", className: "bg-emerald-100 text-emerald-700" };
    case "scheduled":
      return { label: "مجدول", className: "bg-amber-100 text-amber-700" };
    case "expired":
      return { label: "منتهي", className: "bg-red-100 text-red-700" };
    case "paused":
    default:
      return { label: "متوقف", className: "bg-gray-100 text-gray-600" };
  }
}

export const AD_PLACEMENT_LABELS: Record<string, string> = {
  home_hero: "بنر الرئيسية (تحت البحث)",
  home_mid: "بنر وسط الرئيسية",
  stores_list: "بنر صفحة المتاجر",
  store_sidebar: "بنر جانبي في بروفايل المحل",
  home_featured_stores: "محلات مميزة في الرئيسية",
  stores_list_featured: "محلات مميزة في /stores",
  stores_list_sponsored_badge: "شارة ممول داخل النتائج",
};

export function placementLabels(placements?: string[] | null): string[] {
  if (!Array.isArray(placements) || placements.length === 0) return [];
  return placements.map((key) => AD_PLACEMENT_LABELS[key] || key);
}

export function bannerImageUrl(path?: string | null, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") || "";
  return `${base}/storage/${path}`;
}
