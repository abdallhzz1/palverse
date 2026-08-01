import { AdBannerSlot } from "@/components/ads/AdBannerSlot";

export async function PartnerBanner() {
  return (
    <AdBannerSlot
      placement="home_hero"
      variant="hero"
      title="إعلانات"
      subtitle="مساحة ممولة تحت البحث"
      className="bg-white"
    />
  );
}
