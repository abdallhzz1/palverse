"use client";

import { useStoreRequestDetails } from "@/hooks/use-store-request-details";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, AlertTriangle, PlayCircle } from "lucide-react";
import Link from "next/link";
import { RequestStatusBadge } from "@/components/store-requests/request-status-badge";
import { storeRequestsService } from "@/services/store-requests.service";
import { useState } from "react";
import { toast } from "sonner";

// Dialog components from ui (assuming they exist or creating inline versions if we can't be sure)
// Actually, to avoid UI component missing errors, I'll use a simple modal or window.prompt for this simple case, or just simple state for inline forms.
// Let's use a simple inline form for rejection/changes reason.

export default function StoreRequestDetailsPage() {
  const { publicId } = useParams() as { publicId: string };
  const router = useRouter();
  const { data: request, isLoading, error, refresh } = useStoreRequestDetails(publicId);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState<"reject" | "changes" | null>(null);
  const [reasonText, setReasonText] = useState("");

  const handleAction = async (action: "start_review" | "approve" | "reject" | "request_changes") => {
    try {
      setActionLoading(action);
      if (action === "start_review") {
        await storeRequestsService.startReview(publicId);
        toast.success("بدأت مراجعة الطلب");
      } else if (action === "approve") {
        await storeRequestsService.approve(publicId);
        toast.success("تم اعتماد الطلب بنجاح");
      } else if (action === "reject") {
        if (!reasonText.trim()) return toast.error("يرجى إدخال سبب الرفض");
        await storeRequestsService.reject(publicId, reasonText);
        toast.success("تم رفض الطلب");
        setActionForm(null);
      } else if (action === "request_changes") {
        if (!reasonText.trim()) return toast.error("يرجى إدخال التعديلات المطلوبة");
        await storeRequestsService.requestChanges(publicId, reasonText);
        toast.success("تم طلب تعديلات");
        setActionForm(null);
      }
      refresh();
    } catch (err: any) {
      if (err.details && Object.keys(err.details).length > 0) {
        const firstErrorKey = Object.keys(err.details)[0];
        toast.error(err.details[firstErrorKey][0]);
      } else {
        toast.error(err?.message || "حدث خطأ أثناء تنفيذ الإجراء");
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (error || !request) return <div className="p-8 text-center text-red-500">حدث خطأ أو لم يتم العثور على الطلب</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/store-requests" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold">مراجعة طلب: {request.store_name_ar || request.proposed_merchant_name}</h2>
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span>#{request.public_id}</span>
            <span>•</span>
            <span dir="ltr">{new Date(request.created_at).toLocaleString("en-GB")}</span>
          </div>
        </div>
        <div className="mr-auto">
          <RequestStatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">بيانات المحل المقترحة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">اسم المحل المقترح</p>
                <p className="font-medium">{request.store_name_ar || "---"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">الوصف (عربي)</p>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{request.description_ar || "---"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">الوصف (إنجليزي)</p>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{request.description_en || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">التصنيف</p>
                <p className="font-medium">{request.category?.name_ar || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">المدينة / المنطقة</p>
                <p className="font-medium">{request.city?.name_ar || "---"} {request.zone ? ` - ${request.zone.name_ar}` : ""}</p>
              </div>
            </div>
          </div>

          <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">معلومات الاتصال والموقع</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                <p className="font-medium" dir="ltr">{request.phone || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">رقم الواتساب</p>
                <p className="font-medium" dir="ltr">{request.whatsapp || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                <p className="font-medium" dir="ltr">{request.email || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">الموقع الإلكتروني</p>
                <p className="font-medium text-blue-500" dir="ltr">
                  {request.website ? <a href={request.website} target="_blank" rel="noreferrer">{request.website}</a> : "---"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">العنوان (عربي)</p>
                <p className="font-medium">{request.address_ar || "---"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">بيانات الممثل (مقدم الطلب)</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">الاسم</p>
                <p className="font-medium">{request.representative?.name || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                <p className="font-medium" dir="ltr">{request.representative?.phone || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                <p className="font-medium" dir="ltr">{request.representative?.email || "---"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">الصفة الاعتبارية</p>
                <p className="font-medium">مندوب مبيعات</p>
              </div>
            </div>
          </div>

          <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">الإجراءات</h3>
            
            {request.status === "submitted" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">يجب بدء مراجعة الطلب قبل اتخاذ أي قرار.</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleAction("start_review")}
                  disabled={!!actionLoading}
                >
                  <PlayCircle className="w-4 h-4 ml-2" />
                  بدء المراجعة
                </Button>
              </div>
            )}

            {(request.status === "under_review" || request.status === "needs_changes") && (
              <div className="space-y-3">
                {!actionForm ? (
                  <>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                      onClick={() => handleAction("approve")}
                      disabled={!!actionLoading}
                    >
                      <Check className="w-4 h-4 ml-2" />
                      اعتماد الطلب
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20" 
                      onClick={() => { setActionForm("changes"); setReasonText(""); }}
                      disabled={!!actionLoading}
                    >
                      <AlertTriangle className="w-4 h-4 ml-2" />
                      طلب تعديلات
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20" 
                      onClick={() => { setActionForm("reject"); setReasonText(""); }}
                      disabled={!!actionLoading}
                    >
                      <X className="w-4 h-4 ml-2" />
                      رفض الطلب
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3 bg-muted/30 p-4 rounded-md border border-border">
                    <p className="text-sm font-medium">
                      {actionForm === "reject" ? "سبب الرفض" : "التعديلات المطلوبة"}
                    </p>
                    <textarea 
                      className="w-full text-sm border border-border rounded-md p-2 bg-background min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="أدخل السبب هنا..."
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant={actionForm === "reject" ? "danger" : "primary"}
                        onClick={() => handleAction(actionForm === "reject" ? "reject" : "request_changes")}
                        disabled={!!actionLoading || !reasonText.trim()}
                      >
                        تأكيد
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => setActionForm(null)}
                        disabled={!!actionLoading}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(request.resulting_store || request.resulting_merchant) && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">النتائج بعد الاعتماد</p>
                {request.resulting_store && (
                  <Link
                    href={`/stores/${request.resulting_store.public_id}`}
                    className="flex items-center justify-between gap-2 p-3 rounded-md border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <span className="text-sm">
                      <span className="text-muted-foreground">المحل: </span>
                      <span className="font-medium text-foreground dark:text-white">{request.resulting_store.name_ar}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 rotate-180" />
                  </Link>
                )}
                {request.resulting_merchant && (
                  <Link
                    href={`/users/${request.resulting_merchant.public_id}`}
                    className="flex items-center justify-between gap-2 p-3 rounded-md border border-border dark:border-slate-800 hover:bg-muted dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-sm">
                      <span className="text-muted-foreground">التاجر: </span>
                      <span className="font-medium text-foreground dark:text-white">{request.resulting_merchant.name}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
                  </Link>
                )}
              </div>
            )}

            {(request.status === "approved" || request.status === "rejected") && (
              <div className="p-4 bg-muted/50 rounded-md text-center">
                <p className="text-sm text-muted-foreground">تم اتخاذ قرار بشأن هذا الطلب مسبقاً.</p>
                {request.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded text-sm text-right">
                    <strong>سبب الرفض:</strong><br/>
                    {request.rejection_reason}
                  </div>
                )}
                {request.changes_requested_reason && (
                  <div className="mt-3 p-3 bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 rounded text-sm text-right">
                    <strong>التعديلات المطلوبة:</strong><br/>
                    {request.changes_requested_reason}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
