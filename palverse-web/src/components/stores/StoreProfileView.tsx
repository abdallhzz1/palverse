"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Phone,
  MessageCircle,
  QrCode,
  Share2,
  X,
  MapPin,
  Mail,
  Globe,
  Clock,
} from "lucide-react";
import QRCode from "react-qr-code";
import { ImagePreviewModal } from "@/components/layout/ImagePreviewModal";
import { StoreGallery } from "@/components/stores/StoreGallery";
import { StoreOffers } from "@/components/stores/StoreOffers";
import { StoreWorkingHours } from "@/components/stores/StoreWorkingHours";
import {
  SocialPlatformIcon,
  socialPlatformLabel,
} from "@/components/stores/SocialPlatformIcon";
import { sanitizeExternalUrl } from "@/lib/security/urls";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { cn } from "@/lib/utils";
import PublicMap from "@/components/map/PublicMap";
import { RatingSummary } from "@/components/reviews/RatingSummary";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";

export type StoreSocialLinkItem = {
  platform?: string;
  url?: string;
};

type OfferItem = {
  publicId: string;
  title: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  discountPercentage?: string;
  expiresAt?: string;
  imageUrl?: string;
};

type HourItem = {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
};

type TabId = "home" | "about" | "photos" | "reviews";

type StoreProfileViewProps = {
  slug: string;
  name: string;
  categoryName: string;
  description: string;
  cleanLogo: string | null;
  cleanCover: string;
  phone?: string;
  whatsapp?: string;
  storeUrl?: string;
  address?: string;
  email?: string;
  website?: string;
  latitude: number | null;
  longitude: number | null;
  offers: OfferItem[];
  gallery: string[];
  hours: HourItem[];
  socialLinks: StoreSocialLinkItem[];
  ratingSummary: unknown;
};

function FbCard({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-xl bg-white shadow-sm", className)}>
      {title ? (
        <div className="border-b border-[#E4E6EB] px-4 py-3">
          <h2 className="text-[17px] font-bold text-[#050505]">{title}</h2>
        </div>
      ) : null}
      <div className={title ? "p-4" : undefined}>{children}</div>
    </section>
  );
}

export function StoreProfileView({
  slug,
  name,
  categoryName,
  description,
  cleanLogo,
  cleanCover,
  phone,
  whatsapp,
  storeUrl,
  address,
  email,
  website,
  latitude,
  longitude,
  offers,
  gallery,
  hours,
  socialLinks,
  ratingSummary,
}: StoreProfileViewProps) {
  const [tab, setTab] = useState<TabId>("home");
  const [showQr, setShowQr] = useState(false);
  const [logoPreview, setLogoPreview] = useState(false);

  const cover =
    cleanCover && !cleanCover.startsWith("data:") ? cleanCover : BRAND_PHOTOS.storeFallback;

  const safeSocialLinks = useMemo(
    () =>
      socialLinks
        .map((link) => ({
          platform: link.platform || "other",
          url: sanitizeExternalUrl(link.url),
        }))
        .filter((link): link is { platform: string; url: string } => Boolean(link.url)),
    [socialLinks]
  );

  const handleShare = async () => {
    const shareUrl = storeUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `شاهد متجر ${name} على بال فيرس!`,
          url: shareUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      alert("تم نسخ الرابط!");
    }
  };

  const tabs: { id: TabId; label: string; hidden?: boolean }[] = [
    { id: "home", label: "المنشورات" },
    { id: "about", label: "حول" },
    { id: "photos", label: "الصور", hidden: gallery.length === 0 },
    { id: "reviews", label: "التقييمات" },
  ];

  const introCard = (
    <FbCard title="مقدمة">
      {description ? (
        <p className="mb-4 whitespace-pre-wrap text-[15px] leading-6 text-[#050505]">
          {description}
        </p>
      ) : (
        <p className="mb-4 text-[15px] text-[#65676B]">لا توجد نبذة بعد.</p>
      )}

      <ul className="space-y-3 text-[15px] text-[#050505]">
        {categoryName ? (
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB] text-[#050505]">
              <Globe className="h-4 w-4" />
            </span>
            <span className="pt-2">
              الفئة: <strong>{categoryName}</strong>
            </span>
          </li>
        ) : null}
        {address ? (
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB]">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="pt-2 leading-relaxed">{address}</span>
          </li>
        ) : null}
        {phone ? (
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB]">
              <Phone className="h-4 w-4" />
            </span>
            <a href={`tel:${phone}`} className="pt-2 hover:underline" dir="ltr">
              {phone}
            </a>
          </li>
        ) : null}
        {email ? (
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB]">
              <Mail className="h-4 w-4" />
            </span>
            <a href={`mailto:${email}`} className="break-all pt-2 hover:underline">
              {email}
            </a>
          </li>
        ) : null}
        {website ? (
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB]">
              <Globe className="h-4 w-4" />
            </span>
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="break-all pt-2 hover:underline"
            >
              {website.replace(/^https?:\/\//, "")}
            </a>
          </li>
        ) : null}
      </ul>

      {hours.length > 0 ? (
        <div className="mt-4 border-t border-[#E4E6EB] pt-4">
          <div className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-[#050505]">
            <Clock className="h-4 w-4" />
            أوقات العمل
          </div>
          <StoreWorkingHours hours={hours} />
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-lg border border-[#E4E6EB]">
        <PublicMap latitude={latitude} longitude={longitude} storeName={name} compact />
      </div>
    </FbCard>
  );

  const photosWidget =
    gallery.length > 0 ? (
      <FbCard title="الصور">
        <StoreGallery images={gallery.slice(0, 9)} />
        {gallery.length > 9 ? (
          <button
            type="button"
            onClick={() => setTab("photos")}
            className="mt-3 w-full rounded-lg bg-[#E4E6EB] py-2 text-sm font-semibold text-[#050505] transition-colors hover:bg-[#D8DADF]"
          >
            عرض كل الصور
          </button>
        ) : null}
      </FbCard>
    ) : null;

  const offersBlock =
    offers.length > 0 ? (
      <FbCard title="العروض">
        <StoreOffers offers={offers} />
      </FbCard>
    ) : (
      <FbCard>
        <div className="px-4 py-10 text-center text-[15px] text-[#65676B]">
          لا توجد عروض حالياً من هذا المتجر.
        </div>
      </FbCard>
    );

  const reviewsBlock = (
    <FbCard title="التقييمات">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RatingSummary summary={ratingSummary as never} />
        <ReviewForm storeSlug={slug} />
      </div>
      <div className="mt-6 border-t border-[#E4E6EB] pt-6">
        <ReviewList storeSlug={slug} />
      </div>
    </FbCard>
  );

  const photosUnderOffers =
    gallery.length > 0 ? (
      <FbCard title="معرض الصور">
        <StoreGallery images={gallery} />
      </FbCard>
    ) : null;

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      {/* Facebook-style white profile header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-[1095px]">
          <div className="relative mx-0 overflow-hidden md:mx-4 md:rounded-b-xl">
            <div className="relative h-[200px] w-full bg-[#CCD0D5] sm:h-[250px] md:h-[348px]">
              <Image
                src={cover}
                alt=""
                fill
                sizes="(max-width: 1095px) 100vw, 1095px"
                unoptimized
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="relative px-4 pb-0">
            <div className="flex flex-col items-center gap-3 border-b border-[#E4E6EB] pb-4 md:flex-row md:items-end md:gap-5 md:pb-4">
              <button
                type="button"
                onClick={() => cleanLogo && setLogoPreview(true)}
                className={cn(
                  "relative -mt-[84px] flex h-[168px] w-[168px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#E4E6EB] shadow-md md:-mt-[50px]",
                  cleanLogo ? "cursor-pointer" : "cursor-default"
                )}
                aria-label={cleanLogo ? "تكبير الشعار" : undefined}
              >
                {cleanLogo ? (
                  <Image src={cleanLogo} alt={name} fill unoptimized className="object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-[#65676B]">{name.charAt(0)}</span>
                )}
              </button>

              <div className="min-w-0 flex-1 text-center md:pb-3 md:text-start">
                <h1 className="text-[28px] font-bold leading-tight text-[#050505] md:text-[32px]">
                  {name}
                </h1>
                {categoryName ? (
                  <p className="mt-1 text-[15px] font-semibold text-[#65676B]">{categoryName}</p>
                ) : null}
                {safeSocialLinks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    {safeSocialLinks.map((link) => (
                      <a
                        key={`${link.platform}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        title={socialPlatformLabel(link.platform)}
                        aria-label={socialPlatformLabel(link.platform)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4E6EB] text-[#050505] transition-colors hover:bg-[#D8DADF]"
                      >
                        <SocialPlatformIcon platform={link.platform} />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex w-full flex-wrap justify-center gap-2 md:w-auto md:justify-end md:pb-3">
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2F6B4F] px-4 py-2 text-[15px] font-semibold text-white hover:bg-[#1A3D32] md:flex-none"
                  >
                    <Phone className="h-4 w-4" />
                    اتصال
                  </a>
                ) : null}
                {whatsapp ? (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#E4E6EB] px-4 py-2 text-[15px] font-semibold text-[#050505] hover:bg-[#D8DADF] md:flex-none"
                  >
                    <MessageCircle className="h-4 w-4" />
                    رسالة
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E4E6EB] px-3 py-2 text-[15px] font-semibold text-[#050505] hover:bg-[#D8DADF]"
                  aria-label="مشاركة"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                {storeUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowQr(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E4E6EB] px-3 py-2 text-[15px] font-semibold text-[#050505] hover:bg-[#D8DADF]"
                    aria-label="عرض الباركود"
                    title="عرض الباركود"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {tabs
                .filter((t) => !t.hidden)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "relative shrink-0 px-4 py-3.5 text-[15px] font-semibold transition-colors",
                      tab === t.id ? "text-[#1B74E4]" : "text-[#65676B] hover:bg-[#F2F2F2]"
                    )}
                  >
                    {t.label}
                    {tab === t.id ? (
                      <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-[#1B74E4]" />
                    ) : null}
                  </button>
                ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto mt-4 max-w-[1095px] px-0 md:px-4">
        {/* Mobile: tab-driven single column — photos stay after intro */}
        <div className="block space-y-4 px-2 md:hidden">
          {tab === "home" ? (
            <>
              {introCard}
              {photosWidget}
              {offersBlock}
              {reviewsBlock}
            </>
          ) : null}
          {tab === "about" ? introCard : null}
          {tab === "photos" ? (
            <FbCard title="الصور">
              <StoreGallery images={gallery} />
            </FbCard>
          ) : null}
          {tab === "reviews" ? (
            <FbCard title="التقييمات">
              <div className="grid grid-cols-1 gap-6">
                <RatingSummary summary={ratingSummary as never} />
                <ReviewForm storeSlug={slug} />
              </div>
              <div className="mt-6 border-t border-[#E4E6EB] pt-6">
                <ReviewList storeSlug={slug} />
              </div>
            </FbCard>
          ) : null}
        </div>

        {/* Desktop: intro left — offers then gallery then reviews on the right */}
        <div className="hidden gap-4 md:grid md:grid-cols-5">
          <aside className="col-span-2 space-y-4">
            <div className="sticky top-20 space-y-4">
              {(tab === "home" || tab === "about") && introCard}
              {tab === "photos" ? (
                <FbCard title="معرض الصور">
                  <StoreGallery images={gallery} />
                </FbCard>
              ) : null}
            </div>
          </aside>

          <div className="col-span-3 space-y-4">
            {(tab === "home" || tab === "about") && (
              <>
                {offersBlock}
                {photosUnderOffers}
                {reviewsBlock}
              </>
            )}
            {tab === "reviews" ? (
              <FbCard title="التقييمات">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <RatingSummary summary={ratingSummary as never} />
                  <ReviewForm storeSlug={slug} />
                </div>
                <div className="mt-6 border-t border-[#E4E6EB] pt-6">
                  <ReviewList storeSlug={slug} />
                </div>
              </FbCard>
            ) : null}
            {tab === "photos" && gallery.length === 0 ? (
              <FbCard>
                <div className="px-4 py-10 text-center text-[#65676B]">لا توجد صور.</div>
              </FbCard>
            ) : null}
          </div>
        </div>
      </div>

      {cleanLogo ? (
        <ImagePreviewModal
          images={[cleanLogo]}
          isOpen={logoPreview}
          onClose={() => setLogoPreview(false)}
          altText={`شعار ${name}`}
        />
      ) : null}

      {showQr && storeUrl ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex w-full max-w-sm flex-col items-center rounded-xl bg-white p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="absolute top-3 end-3 rounded-full p-2 text-[#65676B] hover:bg-[#F2F2F2]"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-6 text-xl font-bold text-[#050505]">مسح الباركود</h3>
            <div className="mb-4 rounded-lg border border-[#E4E6EB] p-3">
              <QRCode value={storeUrl} size={180} />
            </div>
            <p className="text-center text-sm text-[#65676B]">
              امسح الباركود للوصول إلى صفحة المتجر
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
