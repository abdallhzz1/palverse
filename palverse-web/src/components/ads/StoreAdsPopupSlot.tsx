import { serverFetch } from "@/lib/api/server";
import type { PartnerBannerItem } from "@/components/home/PartnerBannerSlider";
import { StoreAdsPopup } from "@/components/ads/StoreAdsPopup";

async function fetchStoreSidebarBanners(excludeStore?: string): Promise<PartnerBannerItem[]> {
  try {
    const res = await serverFetch<{ data: PartnerBannerItem[] }>("/advertisements/banners", {
      cache: "no-store",
      params: {
        placement: "store_sidebar",
        ...(excludeStore ? { exclude_store: excludeStore } : {}),
      },
    });
    const items = Array.isArray(res?.data)
      ? res.data.filter((b) => b?.image_url || b?.image_path)
      : [];
    return items.slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch store profile ads", error);
    return [];
  }
}

/** Entry popup for store profile — shows up to 3 store_sidebar banners. */
export async function StoreAdsPopupSlot({ excludeStore }: { excludeStore?: string }) {
  const banners = await fetchStoreSidebarBanners(excludeStore);
  if (banners.length === 0) return null;
  return <StoreAdsPopup banners={banners} />;
}
