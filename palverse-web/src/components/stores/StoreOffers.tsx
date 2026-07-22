import { Tag } from "lucide-react";
import Image from "next/image";

interface Offer {
  publicId: string;
  title: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  discountPercentage?: string;
  expiresAt?: string;
  imageUrl?: string;
}

interface StoreOffersProps {
  offers: Offer[];
}

export function StoreOffers({ offers }: StoreOffersProps) {
  if (!offers || offers.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1F2522] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center text-[#1E7D4E]">
          <Tag className="w-4 h-4" />
        </span>
        عروض المتجر
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {offers.map((offer) => (
          <div key={offer.publicId} className="group flex flex-col border border-gray-100 dark:border-[#0F3D2E] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-[#111714]">
            {offer.imageUrl && (
              <div className="relative h-48 w-full bg-gray-50 dark:bg-black/20 overflow-hidden">
                <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                {offer.discountPercentage && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md">
                    خصم {offer.discountPercentage}
                  </div>
                )}
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] text-lg mb-2 line-clamp-1">{offer.title}</h4>
              {offer.description && (
                <p className="text-sm text-[#4A6D56] dark:text-[#8BADA5] mb-4 line-clamp-2 leading-relaxed flex-1">{offer.description}</p>
              )}
              <div className="mt-auto pt-4 border-t border-gray-50 dark:border-white/5">
                {offer.price && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-xl text-[#1E7D4E]">{offer.price}</span>
                    {offer.oldPrice && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through decoration-gray-300">{offer.oldPrice}</span>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#1E7D4E] bg-[#EAF3EC] dark:bg-[#1E7D4E]/20 px-2.5 py-1 rounded-md">
                    {offer.price ? "عرض خاص" : "خصم مميز"}
                  </span>
                  {offer.expiresAt && (
                    <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                      ينتهي في: {offer.expiresAt}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
