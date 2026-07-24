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
    slug?: string | null;
    name_ar?: string | null;
    name_en?: string | null;
  } | null;
};

export function PartnerBannerSlider({ banners }: { banners: PartnerBannerItem[] }) {
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
    <div className="relative w-full overflow-hidden rounded-[1.75rem] border border-[#EAF3EC] bg-[#0F3D2E] shadow-[0_20px_50px_-24px_rgba(15,61,46,0.35)]">
      <div className="relative aspect-[16/10] w-full sm:aspect-[21/9] lg:aspect-[24/9]">
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
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
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
                    sizes="(max-width: 1024px) 100vw, 1152px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    priority={index === 0}
                  />
                ) : (
                  <div className="h-full w-full bg-[#0F3D2E]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/85 via-[#0F3D2E]/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-5 md:flex-row md:items-end md:justify-between md:p-8">
                  <div>
                    <span className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                      إعلان ممول
                    </span>
                    <h3 className="font-heading text-xl font-extrabold text-white md:text-3xl">
                      {storeName}
                    </h3>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0F3D2E] transition-colors group-hover:bg-[#EAF3EC]">
                    زيارة المحل
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {banners.length > 1 ? (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 md:bottom-6">
          {banners.map((banner, index) => (
            <button
              key={banner.public_id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-7 bg-white" : "w-2.5 bg-white/45 hover:bg-white/80"
              }`}
              aria-label={`إعلان ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
