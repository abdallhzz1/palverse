"use client";

import Image from "next/image";
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
      <div className="grid grid-cols-3 gap-1">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            className="relative aspect-square overflow-hidden bg-[#E4E6EB]"
            onClick={() => setPreviewIndex(i)}
          >
            <Image
              src={img}
              alt={`صورة ${i + 1}`}
              fill
              sizes="(max-width: 768px) 33vw, 200px"
              unoptimized
              className="object-cover"
            />
          </button>
        ))}
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
