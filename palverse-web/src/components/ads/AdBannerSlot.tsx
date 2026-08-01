import { serverFetch } from "@/lib/api/server";
import {
  PartnerBannerSlider,
  type BannerVariant,
  type PartnerBannerItem,
} from "@/components/home/PartnerBannerSlider";

type AdBannerSlotProps = {
  variant?: BannerVariant;
  /** Compact heading above the slider. */
  title?: string;
  subtitle?: string;
  /** Hide the whole slot when no active banners (default). */
  showWhenEmpty?: boolean;
  /** Exclude a store so profile pages do not promote themselves. */
  excludeStore?: string;
  className?: string;
  /**
   * Render only the slider (no section/container).
   * Use inside an existing public-container (e.g. /stores).
   */
  embedded?: boolean;
};

async function fetchBanners(excludeStore?: string): Promise<PartnerBannerItem[]> {
  try {
    const res = await serverFetch<{ data: PartnerBannerItem[] }>("/advertisements/banners", {
      cache: "no-store",
      params: excludeStore ? { exclude_store: excludeStore } : undefined,
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
  variant = "hero",
  title,
  subtitle,
  showWhenEmpty = false,
  excludeStore,
  className = "",
  embedded = false,
}: AdBannerSlotProps) {
  const banners = await fetchBanners(excludeStore);

  if (!showWhenEmpty && banners.length === 0) {
    return null;
  }

  const heading =
    title || subtitle ? (
      <div className={embedded ? "mb-4" : undefined}>
        {title ? (
          <h2
            className={`font-heading font-extrabold text-[#0F3D2E] ${
              variant === "sidebar" ? "text-sm" : "text-xl md:text-2xl"
            }`}
          >
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="mt-1 text-sm text-[#5F7B6A]">{subtitle}</p> : null}
      </div>
    ) : null;

  const slider =
    banners.length > 0 ? <PartnerBannerSlider banners={banners} variant={variant} /> : null;

  if (variant === "sidebar" || embedded) {
    if (!slider) return null;
    return (
      <div className={className}>
        {heading}
        {slider}
      </div>
    );
  }

  return (
    <section className={`public-section ${className || "bg-white"}`}>
      <div className="public-container space-y-5">
        {heading}
        {slider}
      </div>
    </section>
  );
}
