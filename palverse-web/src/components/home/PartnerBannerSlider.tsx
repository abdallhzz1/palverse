"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function PartnerBannerSlider({ banners }: { banners: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] rounded-[2rem] overflow-hidden shadow-xl group border border-gray-100">
      {banners.map((banner, index) => (
        <div
          key={banner.public_id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Link href={`/stores/${banner.store.slug}`} className="block w-full h-full relative">
            <img 
              src={banner.image_url} 
              alt={banner.store.name_ar || banner.store.name_en || "إعلان ممول"} 
              className="w-full h-full object-cover"
            />
            {/* Optional overlay indicating it's an ad or linking to store */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              زيارة المتجر
            </div>
          </Link>
        </div>
      ))}

      {/* Dots navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-white w-6 opacity-100" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
