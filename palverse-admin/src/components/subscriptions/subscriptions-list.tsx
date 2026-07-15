"use client";

import { useSubscriptionsList } from "@/hooks/use-subscriptions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Eye, ShieldX } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { SubscriptionStatusBadge, RemainingDaysBadge, getSubscriptionStatusLabel } from "./subscription-status";
import { useState } from "react";
import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";

export function SubscriptionsList() {
  const { data, isLoading, error, params, setFilter, refresh, clearFilters } = useSubscriptionsList();
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);

  const formatPrice = (price: string | number | null, currency: string | null) => {
    if (price === null) return "-";
    const num = Number(price);
    if (isNaN(num)) return price;
    if (num === 0) return "مجاني";
    return new Intl.NumberFormat("ar-PS", {
      style: "currency",
      currency: currency || "ILS",
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="w-full sm:w-48">
          <label className="text-xs text-muted-foreground mb-1 block">الحالة</label>
          <select
            value={params.status || ""}
            onChange={(e) => setFilter("status", e.target.value)}
            className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-1 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
          >
            <option value="">الكل</option>
            <option value="active">نشط</option>
            <option value="pending">قيد الانتظار</option>
            <option value="expired">منتهي</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="text-xs text-muted-foreground mb-1 block">تاريخ البدء من</label>
          <input
            type="date"
            value={params.starts_from || ""}
            onChange={(e) => setFilter("starts_from", e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
          />
        </div>

        <div className="w-full sm:w-48">
          <label className="text-xs text-muted-foreground mb-1 block">تاريخ البدء إلى</label>
          <input
            type="date"
            value={params.starts_to || ""}
            onChange={(e) => setFilter("starts_to", e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
          />
        </div>
        
        <div className="flex items-end pb-0.5">
          <Button variant="ghost" onClick={clearFilters} className="h-9">
            مسح الفلاتر
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error.message || "حدث خطأ أثناء تحميل الاشتراكات"}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المحل</TableHead>
                  <TableHead className="text-right">الخطة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التواريخ</TableHead>
                  <TableHead className="text-right">الزمن المتبقي</TableHead>
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
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      لا توجد اشتراكات مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((subscription) => (
                    <TableRow key={subscription.public_id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link href={`/stores/${subscription.store?.public_id}`} className="font-medium text-[#1E7D4E] hover:underline">
                            {subscription.store?.name_ar || "محل غير معروف"}
                          </Link>
                          <span className="text-xs text-muted-foreground font-sans" dir="ltr">
                            {subscription.store?.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{subscription.plan_name_ar_snapshot || "خطة غير معروفة"}</span>
                          {subscription.plan && (
                            <Link href={`/subscription-plans/${subscription.plan.public_id}`} className="text-xs text-muted-foreground hover:text-[#1E7D4E] underline">
                              عرض الخطة الحالية
                            </Link>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground font-sans" dir="ltr">
                          {formatPrice(subscription.price_snapshot, subscription.currency_snapshot)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SubscriptionStatusBadge status={subscription.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <div>
                            <span className="text-muted-foreground">من:</span>{" "}
                            <span className="font-sans" dir="ltr">
                              {subscription.starts_at ? format(parseISO(subscription.starts_at), "yyyy-MM-dd") : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">إلى:</span>{" "}
                            <span className="font-sans" dir="ltr">
                              {subscription.ends_at ? format(parseISO(subscription.ends_at), "yyyy-MM-dd") : "-"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RemainingDaysBadge endsAt={subscription.ends_at} status={subscription.status} />
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="عرض التفاصيل">
                            <Link href={`/subscriptions/${subscription.public_id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">عرض</span>
                            </Link>
                          </Button>
                          
                          {(subscription.status === "active" || subscription.status === "pending") && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="إلغاء الاشتراك"
                              onClick={() => setCancelDialogId(subscription.public_id)}
                            >
                              <ShieldX className="h-4 w-4" />
                              <span className="sr-only">إلغاء</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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

      {/* Cancel Dialog */}
      {cancelDialogId && (
        <CancelSubscriptionDialog
          publicId={cancelDialogId}
          isOpen={!!cancelDialogId}
          onClose={() => setCancelDialogId(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
