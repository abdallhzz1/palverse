import { AdBannerSlot } from "@/components/ads/AdBannerSlot";

/** Homepage primary banner under search — only home_hero campaigns. */
export async function PartnerBanner() {
  return (
    <AdBannerSlot
      placement="home_hero"
      variant="hero"
      title="إعلانات مميزة"
      subtitle="مساحة بنر عريضة تحت البحث"
    />
  );
}
