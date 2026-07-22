import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import { Tag } from "lucide-react";
import { publicService } from "@/services/public.service";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function OffersPage() {
  let offers = [];
  try {
    const res = await publicService.getOffers(1, 50);
    offers = res?.data || [];
  } catch (error) {
    console.error("Failed to fetch global offers:", error);
  }

  const mappedOffers = offers.map((o: any) => ({
    publicId: o.public_id,
    title: o.title_ar || o.title_en || "",
    description: o.description_ar || o.description_en || undefined,
    price: o.price ? `${o.price} ${o.currency || 'ILS'}` : undefined,
    oldPrice: o.old_price ? `${o.old_price} ${o.currency || 'ILS'}` : undefined,
    discountPercentage: o.discount_percentage ? `${o.discount_percentage}%` : undefined,
    expiresAt: o.ends_at ? new Date(o.ends_at).toLocaleDateString("ar-SA") : undefined,
    imageUrl: o.image_url,
    store: o.store,
  }));

  return (
    <div className="container mx-auto px-4 py-12 pb-24 flex flex-col min-h-[60vh]">
      <BrandSectionHeading title="أحدث العروض والخصومات" subtitle="اكتشف أفضل العروض من المتاجر المشاركة" className="mb-12" />
      
      {mappedOffers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-[#7FA789] py-24 bg-[#F9FBF9] dark:bg-[#171717] border border-dashed border-[#EAF3EC] dark:border-[#0F3D2E] rounded-2xl">
          <Tag className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">لا توجد عروض عامة حالياً</h3>
          <p className="max-w-md">
            يبدو أنه لا توجد عروض نشطة في الوقت الحالي. يرجى التحقق مرة أخرى لاحقاً!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mappedOffers.map((offer: any) => (
            <div key={offer.publicId} className="border border-[#1E7D4E]/20 rounded-2xl overflow-hidden bg-white dark:bg-[#1F2522] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group relative">
              {offer.imageUrl ? (
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  {offer.discountPercentage && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-xl shadow-md">
                      خصم {offer.discountPercentage}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 w-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 flex items-center justify-center overflow-hidden">
                  <Tag className="w-12 h-12 text-[#1E7D4E] opacity-50 group-hover:scale-110 transition-transform duration-500" />
                  {offer.discountPercentage && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-xl shadow-md">
                      خصم {offer.discountPercentage}
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-bold text-lg text-[#0F3D2E] dark:text-[#EAF3EC] mb-2 line-clamp-1">{offer.title}</h4>
                {offer.description && (
                  <p className="text-sm text-[#7FA789] mb-4 line-clamp-2 flex-1">{offer.description}</p>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  {offer.price && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-xl text-[#1E7D4E]">{offer.price}</span>
                      {offer.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">{offer.oldPrice}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs">
                    {offer.expiresAt && (
                      <span className="text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg font-medium">ينتهي: {offer.expiresAt}</span>
                    )}
                  </div>
                  
                  {offer.store && (
                    <Link href={`/stores/${offer.store.slug}`} className="mt-4 flex items-center gap-2 bg-[#F9FBF9] dark:bg-[#171717] p-2 rounded-xl hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/30 transition-colors">
                      {offer.store.logo?.url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-100 shrink-0 relative">
                           <Image src={offer.store.logo.url} alt={offer.store.name_ar} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#1E7D4E]">{offer.store.name_ar?.charAt(0) || "م"}</span>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-[#0F3D2E] dark:text-[#EAF3EC] truncate">{offer.store.name_ar}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
