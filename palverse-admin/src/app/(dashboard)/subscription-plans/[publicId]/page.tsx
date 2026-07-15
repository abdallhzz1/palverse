"use client";

import React from "react";
import { useSubscriptionPlanDetails, useSubscriptionPlanActions } from "@/hooks/use-subscription-plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, Edit2, Play, Pause, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { PlanStatusBadge } from "@/components/subscription-plans/plan-badges";
import { PlanPrice, PlanDuration } from "@/components/subscription-plans/plan-formatting";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPlanDetailsPage({ params }: { params: { publicId: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unwrappedParams = React.use(params as any) as { publicId: string };
  const publicId = unwrappedParams.publicId;

  const router = useRouter();
  const { plan, isLoading, error, refresh } = useSubscriptionPlanDetails(publicId);
  const { activate, deactivate, remove, isSubmitting } = useSubscriptionPlanActions(refresh);
  const [selectedAction, setSelectedAction] = useState<"activate" | "deactivate" | "delete" | null>(null);

  const handleAction = async () => {
    if (selectedAction === "activate") {
      await activate(publicId);
      setSelectedAction(null);
    } else if (selectedAction === "deactivate") {
      await deactivate(publicId);
      setSelectedAction(null);
    } else if (selectedAction === "delete") {
      const success = await remove(publicId);
      if (success) {
        router.push("/subscription-plans");
      } else {
        setSelectedAction(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E7D4E]" />
        <p className="text-muted-foreground">جاري تحميل تفاصيل الخطة...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center max-w-md w-full">
          {error?.message || "لم يتم العثور على خطة الاشتراك"}
        </div>
        <Button variant="outline" asChild>
          <Link href="/subscription-plans">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى القائمة
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/subscription-plans">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
              {plan.name_ar}
            </h2>
            <p className="text-sm text-muted-foreground font-sans" dir="ltr">{plan.code}</p>
          </div>
          <PlanStatusBadge isActive={plan.is_active} />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/subscription-plans/${publicId}/edit`}>
              <Edit2 className="ml-2 h-4 w-4" />
              تعديل
            </Link>
          </Button>

          {plan.is_active ? (
            <Button 
              variant="outline"
              className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              onClick={() => setSelectedAction("deactivate")}
              disabled={isSubmitting}
            >
              <Pause className="ml-2 h-4 w-4" />
              تعطيل
            </Button>
          ) : (
            <Button 
              onClick={() => setSelectedAction("activate")}
              disabled={isSubmitting}
              className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white"
            >
              <Play className="ml-2 h-4 w-4" />
              تفعيل
            </Button>
          )}

          <Button 
            variant="danger"
            onClick={() => setSelectedAction("delete")}
            disabled={isSubmitting}
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>التفاصيل الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-col gap-1 border-b border-border pb-3">
              <span className="text-muted-foreground font-medium">الاسم بالعربية</span>
              <span className="text-foreground font-semibold">{plan.name_ar}</span>
            </div>
            {plan.name_en && (
              <div className="flex flex-col gap-1 border-b border-border pb-3">
                <span className="text-muted-foreground font-medium">الاسم بالإنجليزية</span>
                <span className="text-foreground font-sans" dir="ltr">{plan.name_en}</span>
              </div>
            )}
            
            {(plan.description_ar || plan.description_en) && (
              <div className="flex flex-col gap-3 border-b border-border pb-3">
                <span className="text-muted-foreground font-medium">الوصف</span>
                {plan.description_ar && <p className="text-slate-700">{plan.description_ar}</p>}
                {plan.description_en && <p className="text-slate-700 font-sans" dir="ltr">{plan.description_en}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">تاريخ الإنشاء</span>
                <span className="text-foreground">
                  {plan.created_at ? format(parseISO(plan.created_at), "d MMMM yyyy", { locale: ar }) : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-medium">الترتيب</span>
                <span className="text-foreground font-sans" dir="ltr">{plan.sort_order ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Pricing & Duration */}
          <Card>
            <CardHeader>
              <CardTitle>التسعير والمدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center border border-border">
                  <span className="text-sm text-muted-foreground font-medium mb-1">سعر الاشتراك</span>
                  <PlanPrice plan={plan} className="text-2xl text-[#1E7D4E]" />
                </div>
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center border border-border">
                  <span className="text-sm text-muted-foreground font-medium mb-1">مدة الاشتراك</span>
                  <PlanDuration days={plan.duration_days} className="text-xl font-semibold text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Limits (Features) */}
          <Card>
            <CardHeader>
              <CardTitle>القيود والميزات المسموحة</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-3 rounded-md bg-muted border border-border">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-[#1E7D4E]" />
                    <span className="font-medium">عدد العروض المسموحة</span>
                  </div>
                  <span className="font-semibold px-2.5 py-0.5 rounded bg-card border border-border">
                    {plan.max_offers === null ? "لا محدود" : plan.max_offers}
                  </span>
                </li>
                
                <li className="flex items-center justify-between p-3 rounded-md bg-muted border border-border">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-[#1E7D4E]" />
                    <span className="font-medium">الحد الأقصى لصور المعرض</span>
                  </div>
                  <span className="font-semibold px-2.5 py-0.5 rounded bg-card border border-border">
                    {plan.max_gallery_images === null ? "لا محدود" : plan.max_gallery_images}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedAction}
        onClose={() => !isSubmitting && setSelectedAction(null)}
        title={
          selectedAction === "activate" 
            ? "تفعيل الخطة" 
            : selectedAction === "deactivate" 
              ? "تعطيل الخطة" 
              : "حذف خطة الاشتراك"
        }
        description={
          selectedAction === "activate" 
            ? "هل تريد تفعيل هذه الخطة؟ ستظهر للمشتركين الجدد."
            : selectedAction === "deactivate"
              ? "هل تريد تعطيل هذه الخطة؟ لن تظهر الخطة للاشتراكات الجديدة، وقد تبقى الاشتراكات الحالية كما هي."
              : "هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء."
        }
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setSelectedAction(null)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={isSubmitting}
            className={
              selectedAction === "delete" 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : selectedAction === "deactivate"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white"
            }
          >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
