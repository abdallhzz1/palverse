import { serverFetch } from "@/lib/api/server";
import {
  PartnerBannerSlider,
  type BannerVariant,
  type PartnerBannerItem,
} from "@/components/home/PartnerBannerSlider";
import {
  getBannerPlacement,
  type BannerPlacementId,
} from "@/lib/ads/ad-schedule";

type AdBannerSlotProps = {
  /** Required public slot — only ads created for this placement are shown. */
  placement: BannerPlacementId;
  variant?: BannerVariant;
  title?: string;
  subtitle?: string;
  showWhenEmpty?: boolean;
  excludeStore?: string;
  className?: string;
  embedded?: boolean;
};

async function fetchBanners(
  placement: BannerPlacementId,
  excludeStore?: string
): Promise<PartnerBannerItem[]> {
  try {
    const res = await serverFetch<{ data: PartnerBannerItem[] }>("/advertisements/banners", {
      cache: "no-store",
      params: {
        placement,
        ...(excludeStore ? { exclude_store: excludeStore } : {}),
      },
    });
    return Array.isArray(res?.data)
      ? res.data.filter((b) => b?.image_url || b?.image_path)
      : [];
  } catch (error) {
    console.error("Failed to fetch banners", error);
    return [];
  }
}

export async function AdBannerSlot({
  placement,
  variant,
  title,
  subtitle,
  showWhenEmpty = false,
  excludeStore,
  className = "",
  embedded = false,
}: AdBannerSlotProps) {
  const meta = getBannerPlacement(placement);
  const resolvedVariant = variant || meta?.ui_variant || "inline";
  const banners = await fetchBanners(placement, excludeStore);

  if (!showWhenEmpty && banners.length === 0) {
    return null;
  }

  const heading =
    title || subtitle ? (
      <div className={embedded ? "mb-4" : undefined}>
        {title ? (
          <h2
            className={`font-heading font-extrabold text-[#1A3D32] ${
              resolvedVariant === "sidebar" ? "text-sm" : "text-xl md:text-2xl"
            }`}
          >
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="mt-1 text-sm text-[#6B8578]">{subtitle}</p> : null}
      </div>
    ) : null;

  const slider =
    banners.length > 0 ? (
      <PartnerBannerSlider banners={banners} variant={resolvedVariant} />
    ) : null;

  if (resolvedVariant === "sidebar" || embedded) {
    if (!slider) return null;
    return (
      <div className={className}>
        {heading}
        {slider}
      </div>
    );
  }

  return (
    <section className={`public-section relative z-0 ${className || "bg-white"}`}>
      <div className="public-container space-y-5">
        {heading}
        {slider}
      </div>
    </section>
  );
}
