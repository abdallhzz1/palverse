"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { ImagePreviewModal } from "@/components/layout/ImagePreviewModal";

interface StoreGalleryProps {
  images: string[];
}

export function StoreGallery({ images }: StoreGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="bg-white dark:bg-[#1F2522] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center text-[#1E7D4E]">
            <ImageIcon className="w-4 h-4" />
          </span>
          معرض الصور
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div 
              key={i} 
              className="relative aspect-square rounded-xl overflow-hidden bg-[#EAF3EC] dark:bg-[#0F3D2E]/20 border border-gray-100 dark:border-white/5 group cursor-pointer"
              onClick={() => setPreviewIndex(i)}
            >
              <Image 
                src={img} 
                alt={`Gallery image ${i + 1}`} 
                fill 
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized={true}
                className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <ImagePreviewModal
        images={images}
        initialIndex={previewIndex ?? 0}
        isOpen={previewIndex !== null}
        onClose={() => setPreviewIndex(null)}
        altText="صورة المعرض"
      />
    </>
  );
}
