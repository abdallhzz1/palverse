export interface StoreWorkingHour {
  day_of_week: number;
  day_label_ar: string;
  day_label_en: string;
  is_closed: boolean;
  periods: { opens_at: string; closes_at: string }[];
}

export interface StoreSocialLink {
  id?: number;
  platform: "facebook" | "instagram" | "whatsapp" | "website" | "tiktok" | "x" | "linkedin" | "youtube";
  url: string;
}
