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
      <div className="relative min-h-[280px] w-full overflow-hidden md:min-h-[360px]">
        <Image
          src={cover}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/90 via-[#0F3D2E]/45 to-[#0F3D2E]/15" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-10 pt-24 text-center md:flex-row md:items-end md:text-start">
          <div
            className={`relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl md:h-36 md:w-36 ${cleanLogo ? "cursor-pointer transition-transform hover:scale-105" : ""}`}
            onClick={() => cleanLogo && setIsPreviewOpen(true)}
            title={cleanLogo ? "اضغط لتكبير الصورة" : ""}
          >
            {cleanLogo ? (
              <Image src={cleanLogo} alt={name} fill unoptimized className="object-cover" />
            ) : (
              <span className="text-5xl font-bold text-[#0F3D2E]">{(name || "U").charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 pb-2 text-white">
            <h1 className="mb-3 font-heading text-3xl font-bold drop-shadow-md md:text-5xl">{name}</h1>
            <span className="inline-block rounded-full border border-white/20 bg-[#1E7D4E]/85 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
              {categoryName}
            </span>
          </div>
        </div>
      </div>

      {cleanLogo && (
        <ImagePreviewModal
          images={[cleanLogo]}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          altText={`شعار ${name}`}
        />
      )}
    </>
  );
}
