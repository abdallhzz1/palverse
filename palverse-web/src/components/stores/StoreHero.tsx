"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePreviewModal } from "@/components/layout/ImagePreviewModal";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

interface StoreHeroProps {
  name: string;
  categoryName: string;
  cleanLogo: string | null;
  cleanCover: string;
}

export function StoreHero({ name, categoryName, cleanLogo, cleanCover }: StoreHeroProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const cover =
    typeof cleanCover === "string" && cleanCover.trim() && !cleanCover.startsWith("data:")
      ? cleanCover.trim()
      : BRAND_PHOTOS.storeFallback;

  return (
    <>
      <div className="relative h-40 w-full overflow-hidden bg-[#E8EEEA] md:h-52">
        <Image
          src={cover}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D32]/40 via-transparent to-transparent" />
      </div>

      <div className="public-container relative z-10">
        <div className="-mt-10 flex items-end gap-4 md:-mt-12">
          <button
            type="button"
            className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white md:h-24 md:w-24 ${
              cleanLogo ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={() => cleanLogo && setIsPreviewOpen(true)}
            aria-label={cleanLogo ? "تكبير شعار المتجر" : undefined}
          >
            {cleanLogo ? (
              <Image src={cleanLogo} alt={name} fill unoptimized className="object-cover" />
            ) : (
              <span className="font-heading text-3xl font-bold text-[#1A3D32]">
                {(name || "U").charAt(0)}
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1 pb-1 pt-12 md:pt-14">
            <h1 className="font-heading text-2xl font-extrabold leading-tight text-[#1A3D32] md:text-3xl">
              {name}
            </h1>
            {categoryName ? (
              <p className="mt-1 text-sm font-medium text-[#6B8578]">{categoryName}</p>
            ) : null}
          </div>
        </div>
      </div>

      {cleanLogo ? (
        <ImagePreviewModal
          images={[cleanLogo]}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          altText={`شعار ${name}`}
        />
      ) : null}
    </>
  );
}
