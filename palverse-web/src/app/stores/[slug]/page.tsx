import { StoreProfileView } from "@/components/stores/StoreProfileView";
import { serverFetch } from "@/lib/api/server";
import { notFound } from "next/navigation";
import { sanitizeExternalUrl } from "@/lib/security/urls";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { StoreAdsPopupSlot } from "@/components/ads/StoreAdsPopupSlot";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let storeData: Record<string, unknown> | null = null;
  let ratingSummary: unknown = null;

  try {
    const [storeRes, summaryRes] = await Promise.all([
      serverFetch<{ data: Record<string, unknown> }>(`/stores/${encodeURIComponent(slug)}`, {
        cache: "no-store",
      }),
      serverFetch<{ data: unknown }>(`/stores/${encodeURIComponent(slug)}/reviews/summary`, {
        cache: "no-store",
      }).catch(() => null),
    ]);
    storeData = storeRes?.data;
    ratingSummary = summaryRes || null;
  } catch (error) {
    console.error("Failed to fetch store detail:", error);
  }

  if (!storeData) {
    notFound();
  }

  const name = (storeData.name_ar as string) || (storeData.name_en as string) || "متجر غير معروف";
  const description =
    (storeData.description_ar as string) || (storeData.description_en as string) || "";
  const category = storeData.category as Record<string, unknown> | undefined;
  const categoryName = (category?.name_ar as string) || (category?.name_en as string) || "فئة";

  const coverObj = storeData.cover as { url?: string } | undefined;
  const cleanCover =
    typeof coverObj?.url === "string" && coverObj.url.trim()
      ? coverObj.url.trim()
      : BRAND_PHOTOS.storeFallback;

  const logoObj = storeData.logo as { url?: string } | undefined;
  const cleanLogo =
    typeof logoObj?.url === "string" && logoObj.url.trim() ? logoObj.url.trim() : null;

  const phone = (storeData.phone as string) || undefined;
  const whatsapp = (storeData.whatsapp as string) || undefined;
  const address = (storeData.address_ar as string) || undefined;
  const email = (storeData.email as string) || undefined;
  const website = sanitizeExternalUrl((storeData.website as string) || undefined) || undefined;
  const rawWebUrl = (storeData.web_url as string) || undefined;
  const storeUrl =
    typeof rawWebUrl === "string" && rawWebUrl.trim() ? rawWebUrl.trim() : undefined;

  const latitude =
    typeof storeData.latitude === "number"
      ? storeData.latitude
      : typeof storeData.latitude === "string"
        ? parseFloat(storeData.latitude)
        : null;
  const longitude =
    typeof storeData.longitude === "number"
      ? storeData.longitude
      : typeof storeData.longitude === "string"
        ? parseFloat(storeData.longitude)
        : null;

  const rawOffers = Array.isArray(storeData.offers)
    ? (storeData.offers as Record<string, unknown>[])
    : [];
  const offers = rawOffers.map((o) => ({
    publicId: o.public_id as string,
    title: (o.title_ar as string) || (o.title_en as string) || "",
    description: (o.description_ar as string) || (o.description_en as string) || undefined,
    price: o.price ? `${o.price} ${o.currency || "ILS"}` : undefined,
    oldPrice: o.old_price ? `${o.old_price} ${o.currency || "ILS"}` : undefined,
    discountPercentage: o.discount_percentage ? `${o.discount_percentage}%` : undefined,
    expiresAt: o.ends_at
      ? new Date(o.ends_at as string).toLocaleDateString("ar-SA")
      : undefined,
    imageUrl: o.image_url as string | undefined,
  }));

  const rawGallery = Array.isArray(storeData.gallery) ? storeData.gallery : [];
  const gallery = rawGallery.map((g: { url?: string }) => g?.url as string).filter(Boolean);

  const rawHours = Array.isArray(storeData.working_hours)
    ? (storeData.working_hours as Record<string, unknown>[])
    : [];
  const hours = rawHours.map((h) => {
    const periods = h.periods as { opens_at?: string; closes_at?: string }[] | undefined;
    return {
      day: (h.day_label_ar as string) || (h.day_label_en as string) || `يوم ${h.day_of_week}`,
      isOpen: !h.is_closed,
      openTime: periods?.[0]?.opens_at || undefined,
      closeTime: periods?.[0]?.closes_at || undefined,
    };
  });

  const socialLinks = Array.isArray(storeData.social_links)
    ? (storeData.social_links as { platform?: string; url?: string }[])
    : [];
  const storePublicId = (storeData.public_id as string) || slug;

  return (
    <>
      <StoreAdsPopupSlot excludeStore={storePublicId} />
      <StoreProfileView
        slug={slug}
        name={name}
        categoryName={categoryName}
        description={description}
        cleanLogo={cleanLogo}
        cleanCover={cleanCover}
        phone={phone}
        whatsapp={whatsapp}
        storeUrl={storeUrl}
        address={address}
        email={email}
        website={website}
        latitude={latitude}
        longitude={longitude}
        offers={offers}
        gallery={gallery}
        hours={hours}
        socialLinks={socialLinks}
        ratingSummary={ratingSummary}
      />
    </>
  );
}
