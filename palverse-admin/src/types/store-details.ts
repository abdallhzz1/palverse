export interface StoreWorkingHour {
  id?: number;
  day: "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface StoreSocialLink {
  id?: number;
  platform: "facebook" | "instagram" | "whatsapp" | "website" | "tiktok" | "x" | "linkedin" | "youtube";
  url: string;
}
