"use client";

import { useOffersList, useOfferActions } from "@/hooks/use-offers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Search, Eye, CheckCircle, XCircle, Store as StoreIcon, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { OfferAdminStatusBadge, OfferTimeStateBadge, getOfferVisibilityLabel } from "./offer-badges";
import { OfferPrice } from "./offer-price";
import { OfferPeriod } from "./offer-period";
import { StoreSelect } from "@/components/stores/store-select";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function OffersList() {
  const { data, isLoading, error, params, setFilter, refresh } = useOffersList();
  const { activate, deactivate, isSubmitting } = useOfferActions(refresh);
  const [selectedOffer, setSelectedOffer] = useState<{ id: string, action: "activate" | "deactivate" } | null>(null);

  const handleAction = async () => {
    if (!selectedOffer) return;
    if (selectedOffer.action === "activate") {
      await activate(selectedOffer.id);
    } else {
      await deactivate(selectedOffer.id);
    }
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="ابحث بعنوان العرض..."
            className="pl-3 pr-10"
            defaultValue={params.query}
            onChange={(e) => {
              const val = e.target.value;
              setTimeout(() => setFilter("query", val), 500);
            }}
          />
        </div>
        
        <div className="w-full md:w-64">
          <StoreSelect
            value={params.store_public_id || ""}
            onValueChange={(val) => setFilter("store_public_id", val)}
            allowClear
            placeholder="جميع المحلات"
          />
        </div>

        <select
          value={params.is_active?.toString() || ""}
          onChange={(e) => setFilter("is_active", e.target.value)}
          className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 appearance-none"
        >
          <option value="">جميع الحالات الإدارية</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </select>
        
        <select
          value={params.valid_now?.toString() || ""}
          onChange={(e) => setFilter("valid_now", e.target.value)}
          className="flex h-10 w-full md:w-48 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 appearance-none"
        >
          <option value="">جميع الأوقات</option>
          <option value="true">ساري الآن فقط</option>
        </select>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error.message || "حدث خطأ أثناء تحميل العروض"}
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العرض</TableHead>
                <TableHead className="text-right">المحل</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الفترة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الظهور</TableHead>
                <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    لا توجد عروض مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((offer) => {
                  const visibility = getOfferVisibilityLabel(offer);
                  return (
                    <TableRow key={offer.public_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {offer.image_url ? (
                            <img 
                              src={offer.image_url} 
                              alt={offer.title_ar} 
                              className="w-12 h-12 rounded-md object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{offer.title_ar}</span>
                            {offer.title_en && <span className="text-sm text-slate-500">{offer.title_en}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {offer.store ? (
                          <div className="flex items-center gap-2">
                            <StoreIcon className="h-4 w-4 text-slate-400" />
                            <Link 
                              href={`/stores/${offer.store.public_id}`} 
                              className="text-[#1E7D4E] hover:underline"
                            >
                              {offer.store.name_ar}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <OfferPrice offer={offer} />
                      </TableCell>
                      <TableCell>
                        <OfferPeriod offer={offer} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 items-start">
                          <OfferAdminStatusBadge isActive={offer.is_active} />
                          <OfferTimeStateBadge offer={offer} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={cn("text-sm font-medium", visibility.visible ? "text-[#1E7D4E]" : "text-slate-500")}>
                            {visibility.label}
                          </span>
                          {!visibility.visible && visibility.reason && (
                            <span className="text-xs text-slate-400">{visibility.reason}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild title="عرض التفاصيل">
                            <Link href={`/offers/${offer.public_id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">عرض التفاصيل</span>
                            </Link>
                          </Button>
                          
                          {offer.is_active ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="تعطيل"
                              onClick={() => setSelectedOffer({ id: offer.public_id, action: "deactivate" })}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="sr-only">تعطيل</span>
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#1E7D4E] hover:text-[#1E7D4E] hover:bg-[#EAF3EC]"
                              title="تفعيل"
                              onClick={() => setSelectedOffer({ id: offer.public_id, action: "activate" })}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">تفعيل</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && data && data.meta && data.meta.last_page > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={data.meta.current_page}
            totalPages={data.meta.last_page}
            onPageChange={(page) => setFilter("page", page)}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedOffer}
        onClose={() => !isSubmitting && setSelectedOffer(null)}
        title={selectedOffer?.action === "activate" ? "تفعيل العرض" : "تعطيل العرض"}
        description={
          selectedOffer?.action === "activate" 
            ? "هل تريد تفعيل هذا العرض؟ سيظهر العرض للعامة فقط إذا كان ضمن فترة الصلاحية وكان المحل ظاهرًا للعامة."
            : "هل تريد تعطيل هذا العرض؟ سيتم إخفاء العرض عن الظهور العام."
        }
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setSelectedOffer(null)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={isSubmitting}
            className={selectedOffer?.action === "deactivate" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white"}
          >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
