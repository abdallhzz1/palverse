"use client";

import Image from "next/image";
import { useState } from "react";
import { IslamicPatternBackground } from "@/components/brand/IslamicPatternBackground";
import { ImagePreviewModal } from "@/components/layout/ImagePreviewModal";

interface StoreHeroProps {
  name: string;
  categoryName: string;
  cleanLogo: string | null;
  cleanCover: string;
}

export function StoreHero({ name, categoryName, cleanLogo, cleanCover }: StoreHeroProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className="relative w-full bg-[#0F3D2E]">
        {/* Cover Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={cleanCover} 
            alt={`${name} Cover`} 
            fill 
            sizes="100vw"
            unoptimized={true}
            className="object-cover opacity-40 mix-blend-overlay"
          />
        </div>
        <IslamicPatternBackground className="opacity-20 z-0" />
        
        {/* Store Header Content */}
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-start">
          <div 
            className={`w-32 h-32 md:w-40 md:h-40 bg-white rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center shrink-0 relative ${cleanLogo ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
            onClick={() => cleanLogo && setIsPreviewOpen(true)}
            title={cleanLogo ? "اضغط لتكبير الصورة" : ""}
          >
            {cleanLogo ? (
              <Image src={cleanLogo} alt={name} fill unoptimized={true} className="object-cover" />
            ) : (
              <span className="text-[#0F3D2E] font-bold text-5xl">{(name || "U").charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 text-white pb-2">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-md">{name}</h1>
            <span className="inline-block px-4 py-1.5 bg-[#1E7D4E]/80 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium shadow-sm">
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
