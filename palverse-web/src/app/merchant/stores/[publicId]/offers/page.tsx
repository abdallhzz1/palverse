"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Tag, Calendar, AlertCircle } from "lucide-react";
import { merchantService } from "@/services/merchant.service";
import type { MerchantOffer } from "@/types/merchant";

export default function StoreOffersPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [offers, setOffers] = useState<MerchantOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOffers = async () => {
    try {
      const res = await merchantService.getOffers(resolvedParams.publicId);
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [resolvedParams.publicId]);

  const handleDelete = async (offerId: string) => {
    if (!confirm("هل أنت متأكد من حذف العرض؟")) return;
    try {
      await merchantService.deleteOffer(resolvedParams.publicId, offerId);
      setOffers(offers.filter(o => o.public_id !== offerId));
    } catch (err) {
      alert("فشل حذف العرض");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">العروض الخاصة</h1>
        <Link
          href={`/merchant/stores/${resolvedParams.publicId}/offers/new`}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة عرض
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">لا توجد عروض</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            أضف عروضاً وتخفيضات لجذب المزيد من الزبائن لمحلك.
          </p>
          <Link
            href={`/merchant/stores/${resolvedParams.publicId}/offers/new`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F3D2E] text-white rounded-xl font-bold hover:bg-[#1E7D4E] transition-colors"
          >
            إضافة عرض جديد
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(offer => {
            const now = new Date();
            const start = new Date(offer.starts_at);
            const end = new Date(offer.ends_at);
            
            let status = "";
            let statusColor = "";
            
            if (!offer.is_active) {
              status = "متوقف";
              statusColor = "bg-gray-100 text-gray-700";
            } else if (now < start) {
              status = "مجدول";
              statusColor = "bg-amber-100 text-amber-700";
            } else if (now > end) {
              status = "منتهي";
              statusColor = "bg-red-100 text-red-700";
            } else {
              status = "فعال";
              statusColor = "bg-green-100 text-green-700";
            }

            return (
              <div key={offer.public_id} className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden flex flex-col">
                <div className="relative h-48 bg-gray-100 dark:bg-[#252525]">
                  {offer.image_url ? (
                    <Image src={offer.image_url} alt={offer.title_ar} fill unoptimized={true} className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tag className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] line-clamp-1">{offer.title_ar}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-[#1E7D4E]">{offer.price} {offer.currency}</span>
                    {offer.old_price && (
                      <span className="text-sm text-gray-400 line-through">{offer.old_price} {offer.currency}</span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>يبدأ: {new Date(offer.starts_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                      <Calendar className="w-3 h-3" />
                      <span>ينتهي: {new Date(offer.ends_at).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EAF3EC] dark:border-[#1F2522] flex justify-between items-center mt-auto">
                    <Link
                      href={`/merchant/stores/${resolvedParams.publicId}/offers/${offer.public_id}/edit`}
                      className="flex items-center gap-1 text-sm font-bold text-[#1E7D4E] hover:text-[#0F3D2E] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      تعديل
                    </Link>
                    <button
                      onClick={() => handleDelete(offer.public_id)}
                      className="flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
