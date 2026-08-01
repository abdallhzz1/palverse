import { AdBannerSlot } from "@/components/ads/AdBannerSlot";

/** Homepage primary banner under search — only renders when campaigns are live. */
export async function PartnerBanner() {
  return (
    <AdBannerSlot
      variant="hero"
      title="إعلانات مميزة"
      subtitle="مساحات ترويجية ممولة تصل لجمهورك مباشرة بعد البحث"
    />
  );
}
