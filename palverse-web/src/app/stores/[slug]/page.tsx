import Image from "next/image";
import { StoreProfileCard } from "@/components/stores/StoreProfileCard";
import { StoreGallery } from "@/components/stores/StoreGallery";
import { StoreWorkingHours } from "@/components/stores/StoreWorkingHours";
import { StoreOffers } from "@/components/stores/StoreOffers";
import { StoreHero } from "@/components/stores/StoreHero";
import { serverFetch } from "@/lib/api/server";
import { notFound } from "next/navigation";
import { MapPin, Phone, Globe, Mail, Store, Star } from "lucide-react";
import PublicMap from "@/components/map/PublicMap";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { sanitizeExternalUrl } from "@/lib/security/urls";

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
      serverFetch<{ data: Record<string, unknown> }>(`/stores/${encodeURIComponent(slug)}`, { cache: 'no-store' }),
      serverFetch<{ data: any }>(`/stores/${encodeURIComponent(slug)}/reviews/summary`, { cache: 'no-store' }).catch(() => null)
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
  const description = (storeData.description_ar as string) || (storeData.description_en as string) || "";
  const category = storeData.category as Record<string, unknown> | undefined;
  const categoryName = (category?.name_ar as string) || (category?.name_en as string) || "فئة";
  
  const fallbackCover = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNFQUYzRUMiLz48L3N2Zz4=";
  
  const coverObj = storeData.cover as Record<string, any> | undefined;
  const cover = coverObj?.url as string | undefined;
  const cleanCover = (typeof cover === "string" && cover.trim()) ? cover.trim() : fallbackCover;
  
  const logoObj = storeData.logo as Record<string, any> | undefined;
  const logo = logoObj?.url as string | undefined;
  const cleanLogo = (typeof logo === "string" && logo.trim()) ? logo.trim() : null;
  
  const phone = (storeData.phone as string) || undefined;
  const whatsapp = (storeData.whatsapp as string) || undefined;
  const address_ar = (storeData.address_ar as string) || undefined;
  const email = (storeData.email as string) || undefined;
  const website = sanitizeExternalUrl((storeData.website as string) || undefined) || undefined;
  const rawQrUrl = (storeData.qr_url as string) || undefined;
  const qr_url = (typeof rawQrUrl === "string" && rawQrUrl.trim()) ? rawQrUrl.trim() : undefined;
  
  const latitude = typeof storeData.latitude === 'number' ? storeData.latitude : (typeof storeData.latitude === 'string' ? parseFloat(storeData.latitude) : null);
  const longitude = typeof storeData.longitude === 'number' ? storeData.longitude : (typeof storeData.longitude === 'string' ? parseFloat(storeData.longitude) : null);

  const rawOffers = Array.isArray(storeData.offers) ? storeData.offers as Record<string, any>[] : [];
  const offers = rawOffers.map((o) => ({
    publicId: o.public_id as string,
    title: (o.title_ar as string) || (o.title_en as string) || "",
    description: (o.description_ar as string) || (o.description_en as string) || undefined,
    price: o.price ? `${o.price} ${o.currency || 'ILS'}` : undefined,
    oldPrice: o.old_price ? `${o.old_price} ${o.currency || 'ILS'}` : undefined,
    discountPercentage: o.discount_percentage ? `${o.discount_percentage}%` : undefined,
    expiresAt: o.ends_at ? new Date(o.ends_at as string).toLocaleDateString("ar-SA") : undefined,
    imageUrl: o.image_url as string | undefined,
  }));
  const rawGallery = Array.isArray(storeData.gallery) ? storeData.gallery : [];
  const gallery = rawGallery.map((g: any) => g?.url as string).filter(Boolean);
  // working_hours comes as array of day objects from the API
  const rawHours = Array.isArray(storeData.working_hours) ? storeData.working_hours as Record<string, any>[] : [];
  // Transform to format expected by StoreWorkingHours component
  const hours = rawHours.map((h: any) => ({
    day: h.day_label_ar || h.day_label_en || `يوم ${h.day_of_week}`,
    isOpen: !h.is_closed,
    openTime: h.periods?.[0]?.opens_at || undefined,
    closeTime: h.periods?.[0]?.closes_at || undefined,
  }));
  const socialLinks = Array.isArray(storeData.social_links) ? storeData.social_links as Record<string, any>[] : [];

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Integrated Hero Section with Logo Preview */}
      <StoreHero 
        name={name}
        categoryName={categoryName}
        cleanLogo={cleanLogo}
        cleanCover={cleanCover}
      />

      <div className="container mx-auto px-4">
        {/* Action Bar */}
        <div className="mt-6 md:mt-8 mb-8 relative z-20">
          <StoreProfileCard 
            name={name}
            phone={phone}
            whatsapp={whatsapp}
            qrUrl={qr_url}
          />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content (Right side in RTL) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {description && (
              <div className="bg-white dark:bg-[#1F2522] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center text-[#1E7D4E]">
                    <Store className="w-4 h-4" />
                  </span>
                  نبذة عن المتجر
                </h2>
                <p className="text-[#4A6D56] dark:text-[#8BADA5] leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            )}

            {offers.length > 0 && (
              <StoreOffers offers={offers} />
            )}

            {gallery.length > 0 && (
              <StoreGallery images={gallery as string[]} />
            )}

            {/* Ratings and Reviews Section */}
            <div className="bg-white dark:bg-[#1F2522] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-6 md:p-8 flex flex-col gap-8">
              <h2 className="text-xl md:text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] font-heading flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center text-[#1E7D4E]">
                  <Star className="w-4 h-4" />
                </span>
                تقييمات المتجر
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RatingSummary summary={ratingSummary} />
                <ReviewForm storeSlug={slug} />
              </div>

              <div className="border-t border-[#EAF3EC] dark:border-[#0F3D2E] pt-8">
                <ReviewList storeSlug={slug} />
              </div>
            </div>
          </div>

          {/* Sidebar (Left side in RTL) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Unified Store Info Card */}
            <div className="bg-white dark:bg-[#1F2522] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] overflow-hidden">
              <div className="p-6 border-b border-[#EAF3EC] dark:border-[#0F3D2E]">
                <h3 className="font-bold text-lg text-[#0F3D2E] dark:text-[#EAF3EC]">معلومات المتجر</h3>
              </div>
              
              {/* Contact Information */}
              <div className="p-6 space-y-5">
                {address_ar && (
                  <div className="flex items-start gap-4 text-[#4A6D56] dark:text-[#8BADA5]">
                    <div className="w-10 h-10 rounded-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#1E7D4E]" />
                    </div>
                    <div className="pt-2 text-sm leading-relaxed">{address_ar}</div>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-4 text-[#4A6D56] dark:text-[#8BADA5]">
                    <div className="w-10 h-10 rounded-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#1E7D4E]" />
                    </div>
                    <a href={`tel:${phone}`} className="text-sm hover:text-[#1E7D4E] transition-colors" dir="ltr">{phone}</a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-4 text-[#4A6D56] dark:text-[#8BADA5]">
                    <div className="w-10 h-10 rounded-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#1E7D4E]" />
                    </div>
                    <a href={`mailto:${email}`} className="text-sm hover:text-[#1E7D4E] transition-colors">{email}</a>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-4 text-[#4A6D56] dark:text-[#8BADA5]">
                    <div className="w-10 h-10 rounded-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-[#1E7D4E]" />
                    </div>
                    <a href={website} target="_blank" rel="noreferrer" className="text-sm hover:text-[#1E7D4E] transition-colors line-clamp-1 break-all">{website.replace(/^https?:\/\//, '')}</a>
                  </div>
                )}
              </div>

              {/* Working Hours embedded */}
              {hours.length > 0 && (
                <div className="p-6 bg-gray-50 dark:bg-black/20 border-t border-[#EAF3EC] dark:border-[#0F3D2E]">
                  <StoreWorkingHours hours={hours as any[]} />
                </div>
              )}

              {/* Map embedded */}
              <div className="h-64 relative border-t border-[#EAF3EC] dark:border-[#0F3D2E]">
                <PublicMap latitude={latitude} longitude={longitude} storeName={name} />
              </div>
              
              {/* Social Links as Icons */}
              {socialLinks.length > 0 && (
                <div className="p-6 border-t border-[#EAF3EC] dark:border-[#0F3D2E] flex justify-center gap-3 flex-wrap">
                  {socialLinks
                    .filter((link: any) => sanitizeExternalUrl(link.url))
                    .map((link: any, i: number) => (
                    <a
                      key={i}
                      href={sanitizeExternalUrl(link.url) || "#"}
                      target="_blank"
                      rel="noreferrer"
                      title={link.platform}
                      className="w-10 h-10 rounded-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center text-[#1E7D4E] hover:bg-[#1E7D4E] hover:text-white transition-all shadow-sm"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
