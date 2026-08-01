import { StoreProfileCard } from "@/components/stores/StoreProfileCard";
import { StoreGallery } from "@/components/stores/StoreGallery";
import { StoreWorkingHours } from "@/components/stores/StoreWorkingHours";
import { StoreOffers } from "@/components/stores/StoreOffers";
import { StoreHero } from "@/components/stores/StoreHero";
import { StoreSection } from "@/components/stores/StoreSection";
import { serverFetch } from "@/lib/api/server";
import { notFound } from "next/navigation";
import { MapPin, Phone, Globe, Mail } from "lucide-react";
import PublicMap from "@/components/map/PublicMap";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { sanitizeExternalUrl } from "@/lib/security/urls";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { AdBannerSlot } from "@/components/ads/AdBannerSlot";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let storeData: Record<string, unknown> | null = null;
  let ratingSummary: any = null;

  try {
    const [storeRes, summaryRes] = await Promise.all([
      serverFetch<{ data: Record<string, unknown> }>(`/stores/${encodeURIComponent(slug)}`, {
        cache: "no-store",
      }),
      serverFetch<{ data: any }>(`/stores/${encodeURIComponent(slug)}/reviews/summary`, {
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

  const fallbackCover = BRAND_PHOTOS.storeFallback;
  const coverObj = storeData.cover as Record<string, any> | undefined;
  const cover = coverObj?.url as string | undefined;
  const cleanCover = typeof cover === "string" && cover.trim() ? cover.trim() : fallbackCover;

  const logoObj = storeData.logo as Record<string, any> | undefined;
  const logo = logoObj?.url as string | undefined;
  const cleanLogo = typeof logo === "string" && logo.trim() ? logo.trim() : null;

  const phone = (storeData.phone as string) || undefined;
  const whatsapp = (storeData.whatsapp as string) || undefined;
  const address_ar = (storeData.address_ar as string) || undefined;
  const email = (storeData.email as string) || undefined;
  const website = sanitizeExternalUrl((storeData.website as string) || undefined) || undefined;
  const rawWebUrl = (storeData.web_url as string) || undefined;
  const store_url =
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
    ? (storeData.offers as Record<string, any>[])
    : [];
  const offers = rawOffers.map((o) => ({
    publicId: o.public_id as string,
    title: (o.title_ar as string) || (o.title_en as string) || "",
    description: (o.description_ar as string) || (o.description_en as string) || undefined,
    price: o.price ? `${o.price} ${o.currency || "ILS"}` : undefined,
    oldPrice: o.old_price ? `${o.old_price} ${o.currency || "ILS"}` : undefined,
    discountPercentage: o.discount_percentage ? `${o.discount_percentage}%` : undefined,
    expiresAt: o.ends_at ? new Date(o.ends_at as string).toLocaleDateString("ar-SA") : undefined,
    imageUrl: o.image_url as string | undefined,
  }));

  const rawGallery = Array.isArray(storeData.gallery) ? storeData.gallery : [];
  const gallery = rawGallery.map((g: any) => g?.url as string).filter(Boolean);

  const rawHours = Array.isArray(storeData.working_hours)
    ? (storeData.working_hours as Record<string, any>[])
    : [];
  const hours = rawHours.map((h: any) => ({
    day: h.day_label_ar || h.day_label_en || `يوم ${h.day_of_week}`,
    isOpen: !h.is_closed,
    openTime: h.periods?.[0]?.opens_at || undefined,
    closeTime: h.periods?.[0]?.closes_at || undefined,
  }));

  const socialLinks = Array.isArray(storeData.social_links)
    ? (storeData.social_links as Record<string, any>[])
    : [];
  const storePublicId = (storeData.public_id as string) || slug;

  const hasContactInfo = Boolean(address_ar || phone || email || website);

  return (
    <div className="w-full bg-[#F7F9F8] pb-16">
      <StoreHero
        name={name}
        categoryName={categoryName}
        cleanLogo={cleanLogo}
        cleanCover={cleanCover}
      />

      <div className="public-container mt-4 space-y-6 md:mt-5">
        <StoreProfileCard
          name={name}
          phone={phone}
          whatsapp={whatsapp}
          storeUrl={store_url}
          socialLinks={socialLinks}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-8">
            {description ? (
              <StoreSection title="نبذة عن المتجر">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#3D554A] md:text-base">
                  {description}
                </p>
              </StoreSection>
            ) : null}

            {offers.length > 0 ? (
              <StoreSection title="العروض">
                <StoreOffers offers={offers} />
              </StoreSection>
            ) : null}

            {gallery.length > 0 ? (
              <StoreSection title="معرض الصور">
                <StoreGallery images={gallery as string[]} />
              </StoreSection>
            ) : null}

            <StoreSection title="التقييمات">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <RatingSummary summary={ratingSummary} />
                <ReviewForm storeSlug={slug} />
              </div>
              <div className="mt-6 border-t border-[#E2EAE5] pt-6">
                <ReviewList storeSlug={slug} />
              </div>
            </StoreSection>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4">
            {hasContactInfo ? (
              <div className="rounded-xl border border-[#E2EAE5] bg-white p-5">
                <h3 className="mb-4 font-heading text-base font-bold text-[#1A3D32]">معلومات التواصل</h3>
                <div className="space-y-4">
                  {address_ar ? (
                    <div className="flex items-start gap-3 text-sm text-[#3D554A]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6B4F]" />
                      <span className="leading-relaxed">{address_ar}</span>
                    </div>
                  ) : null}
                  {phone ? (
                    <div className="flex items-center gap-3 text-sm text-[#3D554A]">
                      <Phone className="h-4 w-4 shrink-0 text-[#2F6B4F]" />
                      <a href={`tel:${phone}`} className="hover:text-[#2F6B4F]" dir="ltr">
                        {phone}
                      </a>
                    </div>
                  ) : null}
                  {email ? (
                    <div className="flex items-center gap-3 text-sm text-[#3D554A]">
                      <Mail className="h-4 w-4 shrink-0 text-[#2F6B4F]" />
                      <a href={`mailto:${email}`} className="break-all hover:text-[#2F6B4F]">
                        {email}
                      </a>
                    </div>
                  ) : null}
                  {website ? (
                    <div className="flex items-center gap-3 text-sm text-[#3D554A]">
                      <Globe className="h-4 w-4 shrink-0 text-[#2F6B4F]" />
                      <a
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-1 break-all hover:text-[#2F6B4F]"
                      >
                        {website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {hours.length > 0 ? (
              <div className="rounded-xl border border-[#E2EAE5] bg-white p-5">
                <h3 className="mb-3 font-heading text-base font-bold text-[#1A3D32]">أوقات العمل</h3>
                <StoreWorkingHours hours={hours as any[]} />
              </div>
            ) : null}

            <div className="overflow-hidden rounded-xl border border-[#E2EAE5] bg-white">
              <PublicMap
                latitude={latitude}
                longitude={longitude}
                storeName={name}
                compact
              />
            </div>

            <AdBannerSlot
              placement="store_sidebar"
              variant="sidebar"
              title="إعلان ممول"
              excludeStore={storePublicId}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
