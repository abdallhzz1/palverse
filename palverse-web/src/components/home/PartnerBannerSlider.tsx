"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { resolveStorageUrl } from "@/lib/media/resolve-storage-url";

export type PartnerBannerItem = {
  public_id: string;
  image_url?: string | null;
  image_path?: string | null;
  store?: {
    public_id?: string | null;
    slug?: string | null;
    name_ar?: string | null;
    name_en?: string | null;
  } | null;
};

export type BannerVariant = "hero" | "inline" | "sidebar";

const VARIANT_ASPECT: Record<BannerVariant, string> = {
  hero: "aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/9]",
  inline: "aspect-[16/9] sm:aspect-[21/8]",
  sidebar: "aspect-[4/5]",
};

export function PartnerBannerSlider({
  banners,
  variant = "hero",
}: {
  banners: PartnerBannerItem[];
  variant?: BannerVariant;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#E2EAE5] bg-[#1A3D32]">
      <div className={`relative w-full ${VARIANT_ASPECT[variant]}`}>
        {banners.map((banner, index) => {
          const src =
            resolveStorageUrl(banner.image_url) ||
            resolveStorageUrl(banner.image_path) ||
            "";
          const storeName = banner.store?.name_ar || banner.store?.name_en || "إعلان ممول";
          const href = banner.store?.slug ? `/stores/${banner.store.slug}` : "/stores";
          const active = index === currentIndex;

          return (
            <div
              key={banner.public_id}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              }`}
            >
              <Link href={href} className="group relative block h-full w-full">
                {src ? (
                  <Image
                    src={src}
                    alt={storeName}
                    fill
                    unoptimized
                    sizes={
                      variant === "sidebar"
                        ? "(max-width: 1024px) 100vw, 360px"
                        : "(max-width: 1024px) 100vw, 1152px"
                    }
                    className="object-cover"
                    priority={variant === "hero" && index === 0}
                  />
                ) : (
                  <div className="h-full w-full bg-[#1A3D32]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D32]/75 via-transparent to-transparent" />
                <div
                  className={`absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 ${
                    variant === "sidebar"
                      ? "p-4"
                      : "p-4 md:flex-row md:items-end md:justify-between md:p-6"
                  }`}
                >
                  <div>
                    <span className="mb-1.5 inline-flex rounded-md bg-black/35 px-2 py-0.5 text-[11px] font-bold text-white">
                      إعلان
                    </span>
                    <h3
                      className={`font-heading font-extrabold text-white ${
                        variant === "sidebar" ? "text-base" : "text-lg md:text-2xl"
                      }`}
                    >
                      {storeName}
                    </h3>
                  </div>
                  {variant !== "sidebar" ? (
                    <span className="inline-flex w-fit items-center rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1A3D32] transition-colors group-hover:bg-[#E8EEEA]">
                      زيارة المحل
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {banners.length > 1 ? (
        <div
          className={`absolute left-0 right-0 z-20 flex justify-center gap-1.5 ${
            variant === "sidebar" ? "bottom-3" : "bottom-3 md:bottom-4"
          }`}
        >
          {banners.map((banner, index) => (
            <button
              key={banner.public_id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/80"
              }`}
              aria-label={`إعلان ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
