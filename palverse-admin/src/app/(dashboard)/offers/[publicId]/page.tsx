"use client";

import React from "react";
import { useOfferDetails, useOfferActions } from "@/hooks/use-offers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, Store, Calendar, CheckCircle, XCircle, Info, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { OfferAdminStatusBadge, OfferTimeStateBadge, getOfferVisibilityLabel } from "@/components/offers/offer-badges";
import { OfferPrice } from "@/components/offers/offer-price";
import { OfferPeriod } from "@/components/offers/offer-period";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function OfferDetailsPage({ params }: { params: { publicId: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unwrappedParams = React.use(params as any) as { publicId: string };
  const publicId = unwrappedParams.publicId;

  const { offer, isLoading, error, refresh } = useOfferDetails(publicId);
  const { activate, deactivate, isSubmitting } = useOfferActions(refresh);
  const [selectedAction, setSelectedAction] = useState<"activate" | "deactivate" | null>(null);

  const handleAction = async () => {
    if (selectedAction === "activate") {
      await activate(publicId);
    } else if (selectedAction === "deactivate") {
      await deactivate(publicId);
    }
    setSelectedAction(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E7D4E]" />
        <p className="text-muted-foreground">جاري تحميل تفاصيل العرض...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center max-w-md w-full">
          {error?.message || "لم يتم العثور على العرض"}
        </div>
        <Button variant="outline" asChild>
          <Link href="/offers">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى العروض
          </Link>
        </Button>
      </div>
    );
  }

  const visibility = getOfferVisibilityLabel(offer);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/offers">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
            تفاصيل العرض
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {offer.is_active ? (
            <Button 
              variant="danger"
              onClick={() => setSelectedAction("deactivate")}
              disabled={isSubmitting}
            >
              <XCircle className="ml-2 h-4 w-4" />
              تعطيل العرض
            </Button>
          ) : (
            <Button 
              onClick={() => setSelectedAction("activate")}
              disabled={isSubmitting}
              className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white"
            >
              <CheckCircle className="ml-2 h-4 w-4" />
              تفعيل العرض
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العرض</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-1/3 aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                  {offer.image_url ? (
                    <img 
                      src={offer.image_url} 
                      alt={offer.title_ar} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-slate-300" />
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{offer.title_ar}</h3>
                    {offer.title_en && <p className="text-muted-foreground font-sans" dir="ltr">{offer.title_en}</p>}
                  </div>
                  
                  {(offer.description_ar || offer.description_en) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">الوصف</h4>
                      {offer.description_ar && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{offer.description_ar}</p>
                      )}
                      {offer.description_en && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans" dir="ltr">{offer.description_en}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-border flex flex-wrap gap-y-4 gap-x-8">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">السعر</h4>
                      <OfferPrice offer={offer} className="text-lg" />
                    </div>
                    {offer.discount_percentage && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">نسبة الخصم</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {offer.discount_percentage}% خصم
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timeline info */}
          <Card>
            <CardHeader>
              <CardTitle>فترة وصلاحية العرض</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">حالة الظهور والإدارة</h4>
                  <div className="flex gap-2 items-center mt-2">
                    <OfferAdminStatusBadge isActive={offer.is_active} />
                    <OfferTimeStateBadge offer={offer} />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">التواريخ</h4>
                  <OfferPeriod offer={offer} className="mt-2 text-base font-medium text-foreground" />
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <p>تاريخ الإنشاء: {offer.created_at ? format(parseISO(offer.created_at), "d MMMM yyyy, h:mm a", { locale: ar }) : "-"}</p>
                    <p>آخر تحديث: {offer.updated_at ? format(parseISO(offer.updated_at), "d MMMM yyyy, h:mm a", { locale: ar }) : "-"}</p>
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "mt-6 p-4 rounded-lg flex items-start gap-3",
                visibility.visible ? "bg-[#EAF3EC] text-[#0F3D2E]" : "bg-muted text-slate-700"
              )}>
                <Info className={cn("h-5 w-5 shrink-0 mt-0.5", visibility.visible ? "text-[#1E7D4E]" : "text-muted-foreground")} />
                <div>
                  <h5 className="font-semibold">{visibility.label}</h5>
                  <p className="text-sm mt-1">
                    {visibility.visible 
                      ? "هذا العرض نشط ومتاح حالياً في التطبيق ويتم عرضه لجميع المستخدمين."
                      : visibility.reason || "هذا العرض غير متاح للظهور العام حالياً."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" />
                المحل التابع له
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offer.store ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-foreground">{offer.store.name_ar}</h4>
                    {offer.store.name_en && <p className="text-sm text-muted-foreground font-sans" dir="ltr">{offer.store.name_en}</p>}
                  </div>
                  
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">حالة المحل</span>
                      <span className="font-medium text-foreground">{offer.store.is_active ? "نشط" : "غير نشط"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">حالة الاعتماد</span>
                      <span className="font-medium text-foreground">
                        {offer.store.status === "approved" ? "معتمد" : offer.store.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href={`/stores/${offer.store.public_id}`}>
                      عرض ملف المحل
                      <LinkIcon className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">بيانات المحل غير متوفرة</p>
              )}
            </CardContent>
          </Card>
        </div>
        
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedAction}
        onClose={() => !isSubmitting && setSelectedAction(null)}
        title={selectedAction === "activate" ? "تفعيل العرض" : "تعطيل العرض"}
        description={
          selectedAction === "activate" 
            ? "هل تريد تفعيل هذا العرض؟ سيظهر العرض للعامة فقط إذا كان ضمن فترة الصلاحية وكان المحل ظاهرًا للعامة."
            : "هل تريد تعطيل هذا العرض؟ سيتم إخفاء العرض عن الظهور العام."
        }
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setSelectedAction(null)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={isSubmitting}
            className={selectedAction === "deactivate" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white"}
          >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
