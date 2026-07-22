"use client";

import React, { useState } from "react";
import { useSubscriptionDetails } from "@/hooks/use-subscriptions";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Info, Store as StoreIcon, ShieldX, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { SubscriptionStatusBadge, RemainingDaysBadge, getSubscriptionStatusLabel } from "@/components/subscriptions/subscription-status";
import { formatPlanPrice } from "@/components/subscription-plans/plan-formatting";
import { CancelSubscriptionDialog } from "@/components/subscriptions/cancel-subscription-dialog";

export default function SubscriptionDetailsPage({ params }: { params: Promise<{ publicId: string }> }) {
  const unwrappedParams = React.use(params);
  const { subscription, isLoading, error, refresh } = useSubscriptionDetails(unwrappedParams.publicId);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-md text-center">
          {error?.message || "لم يتم العثور على الاشتراك"}
        </div>
        <Button variant="outline" asChild>
          <Link href="/subscriptions">العودة إلى الاشتراكات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/subscriptions">
              <ArrowRight className="h-5 w-5" />
              <span className="sr-only">عودة</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">تفاصيل الاشتراك</h1>
              <SubscriptionStatusBadge status={subscription.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-sans" dir="ltr">
              ID: {subscription.public_id}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(subscription.status === "cancelled" || subscription.status === "expired") &&
            subscription.store?.public_id && (
            <Button className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white" asChild>
              <Link
                href={`/subscriptions/new?store_public_id=${encodeURIComponent(subscription.store.public_id)}`}
              >
                تعيين اشتراك جديد لهذا المحل
              </Link>
            </Button>
          )}
          {(subscription.status === "active" || subscription.status === "pending") && (
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => setCancelDialogOpen(true)}
            >
              <ShieldX className="ml-2 h-4 w-4" />
              إلغاء الاشتراك
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details & Dates */}
        <div className="space-y-6 md:col-span-2">
          
          {/* Main Info Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                معلومات الاشتراك
              </h3>
              <RemainingDaysBadge endsAt={subscription.ends_at} status={subscription.status} />
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">حالة الاشتراك</dt>
                  <dd className="mt-1 font-semibold text-foreground">{getSubscriptionStatusLabel(subscription.status)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">سعر الخطة (وقت التعيين)</dt>
                  <dd className="mt-1 font-semibold text-[#1E7D4E] font-sans" dir="ltr">
                    {subscription.price_snapshot !== null ? formatPlanPrice(subscription.price_snapshot, subscription.currency_snapshot) : "مجاني"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">اسم الخطة (وقت التعيين)</dt>
                  <dd className="mt-1 font-medium text-foreground">{subscription.plan_name_ar_snapshot || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">عين بواسطة</dt>
                  <dd className="mt-1 text-foreground">{subscription.assigned_by?.name || "نظام"}</dd>
                </div>
              </dl>
              
              {subscription.notes && (
                <div className="mt-6 pt-4 border-t border-border">
                  <dt className="text-sm font-medium text-muted-foreground mb-2">ملاحظات الإدارة</dt>
                  <dd className="text-sm text-slate-700 bg-muted p-4 rounded-md">{subscription.notes}</dd>
                </div>
              )}

              {subscription.cancellation_reason && (
                <div className="mt-6 pt-4 border-t border-red-100">
                  <dt className="text-sm font-medium text-red-600 mb-2">سبب الإلغاء</dt>
                  <dd className="text-sm text-red-700 bg-red-50 p-4 rounded-md">{subscription.cancellation_reason}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                السجل الزمني
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">تاريخ البدء</dt>
                  <dd className="mt-1 font-medium text-foreground font-sans" dir="ltr">
                    {subscription.starts_at ? format(parseISO(subscription.starts_at), "yyyy-MM-dd HH:mm") : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">تاريخ الانتهاء المتوقع</dt>
                  <dd className="mt-1 font-medium text-foreground font-sans" dir="ltr">
                    {subscription.ends_at ? format(parseISO(subscription.ends_at), "yyyy-MM-dd HH:mm") : "-"}
                  </dd>
                </div>
                
                {subscription.activated_at && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">تاريخ التفعيل الفعلي</dt>
                    <dd className="mt-1 font-medium text-foreground font-sans" dir="ltr">
                      {format(parseISO(subscription.activated_at), "yyyy-MM-dd HH:mm")}
                    </dd>
                  </div>
                )}
                
                {subscription.cancelled_at && (
                  <div>
                    <dt className="text-sm font-medium text-red-500">تاريخ الإلغاء</dt>
                    <dd className="mt-1 font-medium text-foreground font-sans" dir="ltr">
                      {format(parseISO(subscription.cancelled_at), "yyyy-MM-dd HH:mm")}
                    </dd>
                    {subscription.cancelled_by && (
                      <p className="text-xs text-muted-foreground mt-1">بواسطة: {subscription.cancelled_by.name}</p>
                    )}
                  </div>
                )}
                
                {subscription.expired_at && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">تاريخ الانتهاء الفعلي</dt>
                    <dd className="mt-1 font-medium text-foreground font-sans" dir="ltr">
                      {format(parseISO(subscription.expired_at), "yyyy-MM-dd HH:mm")}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: References (Store & Plan) */}
        <div className="space-y-6">
          
          {/* Store Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <StoreIcon className="h-5 w-5 text-muted-foreground" />
                المحل المرتبط
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {subscription.store ? (
                <>
                  <div>
                    <div className="font-semibold text-lg text-foreground">{subscription.store.name_ar}</div>
                    <div className="text-sm text-muted-foreground font-sans" dir="ltr">{subscription.store.slug}</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{subscription.store.category?.name_ar || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{subscription.store.city?.name_ar || "-"}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/stores/${subscription.store.public_id}`}>عرض ملف المحل</Link>
                  </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-4">بيانات المحل غير متوفرة</div>
              )}
            </div>
          </div>

          {/* Plan Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                الخطة الحالية
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {subscription.plan ? (
                <>
                  <div>
                    <div className="font-semibold text-lg text-foreground">{subscription.plan.name_ar}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {subscription.plan.is_active ? (
                        <span className="text-green-600 font-medium">متاحة حالياً</span>
                      ) : (
                        <span className="text-red-500 font-medium">غير متاحة للاشتراكات الجديدة</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="py-3 border-y border-border flex justify-between items-center">
                    <span className="text-muted-foreground">السعر القياسي:</span>
                    <span className="font-bold text-[#1E7D4E] font-sans" dir="ltr">
                      {formatPlanPrice(subscription.plan.price, subscription.plan.currency)}
                    </span>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/subscription-plans/${subscription.plan.public_id}`}>عرض تفاصيل الخطة</Link>
                  </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-4">بيانات الخطة غير متوفرة</div>
              )}
            </div>
          </div>

        </div>
      </div>

      <CancelSubscriptionDialog
        publicId={subscription.public_id}
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
