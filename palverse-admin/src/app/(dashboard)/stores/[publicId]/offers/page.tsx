"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus, Edit2, Trash2, Tag, Calendar } from "lucide-react";
import { StoreDetailNav } from "@/components/stores/store-detail-nav";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStoreOffersList } from "@/hooks/use-store-offers";
import type { StoreOffer } from "@/types/store";

function getOfferStatus(offer: StoreOffer) {
  const now = new Date();
  const start = offer.starts_at ? new Date(offer.starts_at) : null;
  const end = offer.ends_at ? new Date(offer.ends_at) : null;

  if (!offer.is_active) {
    return { label: "متوقف", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
  }
  if (start && now < start) {
    return { label: "مجدول", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  }
  if (end && now > end) {
    return { label: "منتهي", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  }
  return { label: "فعال", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
}

export default function StoreOffersPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const { offers, meta, page, setPage, isLoading, remove } = useStoreOffersList(publicId);
  const [pendingDelete, setPendingDelete] = useState<StoreOffer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    await remove(pendingDelete.public_id);
    setIsDeleting(false);
    setPendingDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${publicId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">العروض الخاصة</h2>
        </div>
      </div>

      <StoreDetailNav publicId={publicId} />

      <div className="flex justify-end">
        <Button asChild className="gap-2 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white">
          <Link href={`/stores/${publicId}/offers/new`}>
            <Plus className="w-4 h-4" />
            إضافة عرض
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 p-12 text-center">
          <div className="w-20 h-20 bg-muted dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">لا توجد عروض</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">أضف عروضاً وتخفيضات لجذب المزيد من الزبائن لهذا المحل.</p>
          <Button asChild className="bg-[#0F3D2E] hover:bg-[#1E7D4E] text-white">
            <Link href={`/stores/${publicId}/offers/new`}>إضافة عرض جديد</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const status = getOfferStatus(offer);
              return (
                <div
                  key={offer.public_id}
                  className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 bg-muted dark:bg-slate-800">
                    {offer.image_url ? (
                      <Image src={offer.image_url} alt={offer.title_ar} fill unoptimized={true} className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${status.className}`}>{status.label}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-foreground dark:text-white line-clamp-1">{offer.title_ar}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-bold text-[#1E7D4E] dark:text-emerald-400">
                        {offer.price ?? "-"} {offer.currency}
                      </span>
                      {offer.old_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {offer.old_price} {offer.currency}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
                      {offer.starts_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>يبدأ: {new Date(offer.starts_at).toLocaleDateString("en-GB")}</span>
                        </div>
                      )}
                      {offer.ends_at && (
                        <div className="flex items-center gap-1 text-red-400">
                          <Calendar className="w-3 h-3" />
                          <span>ينتهي: {new Date(offer.ends_at).toLocaleDateString("en-GB")}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border dark:border-slate-800 flex justify-between items-center mt-auto">
                      <Link
                        href={`/stores/${publicId}/offers/${offer.public_id}/edit`}
                        className="flex items-center gap-1 text-sm font-bold text-[#1E7D4E] dark:text-emerald-400 hover:text-[#0F3D2E] dark:hover:text-emerald-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                      </Link>
                      <button
                        onClick={() => setPendingDelete(offer)}
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

          {meta && meta.last_page > 1 && (
            <Pagination currentPage={page} totalPages={meta.last_page} onPageChange={setPage} disabled={isLoading} />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا العرض؟"
        variant="danger"
        confirmText="حذف"
        isLoading={isDeleting}
      />
    </div>
  );
}
