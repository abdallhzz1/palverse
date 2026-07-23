"use client";

import { use, useEffect, useState } from "react";
import { followUpService } from "@/services/followUp.service";
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  PlayCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function FollowUpStoreRequestDetail({ params }: { params: Promise<{ publicId: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [requestData, setRequestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "request_changes" | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await followUpService.getStoreRequest(unwrappedParams.publicId);
        setRequestData(res?.data ?? res);
      } catch (error) {
        console.error("Failed to load request details:", error);
        toast.error("فشل تحميل تفاصيل الطلب");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequest();
  }, [unwrappedParams.publicId]);

  const handleStartReview = async () => {
    try {
      setIsSubmitting(true);
      const res = await followUpService.reviewStoreRequest(unwrappedParams.publicId, 'start_review');
      setRequestData(res?.data ?? res);
      toast.success("تم بدء المراجعة بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء بدء المراجعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewAction) return;
    if ((reviewAction === 'reject' || reviewAction === 'request_changes') && reviewReason.length < 10) {
      toast.error("يجب إدخال سبب المراجعة (10 أحرف على الأقل)");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await followUpService.reviewStoreRequest(unwrappedParams.publicId, reviewAction, reviewReason);
      setRequestData(res?.data ?? res);
      toast.success("تم تقديم المراجعة بنجاح");
      router.push("/follow-up/store-requests");
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تقديم المراجعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الطلب غير موجود</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'needs_changes': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'draft': return 'مسودة';
      case 'submitted': return 'مقدم (بانتظار المراجعة)';
      case 'under_review': return 'قيد المراجعة';
      case 'approved': return 'معتمد';
      case 'rejected': return 'مرفوض';
      case 'needs_changes': return 'يحتاج تعديلات';
      default: return status;
    }
  };

  const canReview = requestData.status === 'under_review';
  const canStartReview = requestData.status === 'submitted';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/follow-up/store-requests"
            className="p-2 bg-white dark:bg-[#1A1A1A] rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
              تفاصيل الطلب: {requestData.store_name_ar}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(requestData.status)}`}>
                {getStatusLabel(requestData.status)}
              </span>
              <span className="text-sm text-gray-500">
                تاريخ التقديم: {new Date(requestData.created_at).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
        </div>
        
        {canStartReview && (
          <button
            onClick={handleStartReview}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-70"
          >
            <PlayCircle className="w-5 h-5" />
            بدء المراجعة
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Store Info */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1E7D4E]" />
              بيانات المتجر المقترح
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">اسم المتجر (بالعربية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{requestData.store_name_ar}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">اسم المتجر (بالانجليزية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{requestData.store_name_en || 'غير محدد'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">الوصف (بالعربية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1 whitespace-pre-line">{requestData.description_ar || 'غير محدد'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">الوصف (بالانجليزية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1 whitespace-pre-line">{requestData.description_en || 'غير محدد'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">التصنيف</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{requestData.category?.name_ar || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1E7D4E]" />
              معلومات التواصل والعنوان
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">المدينة</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{requestData.city?.name_ar}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">المنطقة الجغرافية</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{requestData.zone?.name_ar}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">العنوان التفصيلي (بالعربية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {requestData.address_ar}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف الأساسي</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1" dir="ltr">{requestData.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">رقم الواتساب</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1" dir="ltr">{requestData.whatsapp || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          {/* Review Actions Panel */}
          {canReview && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
              <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#1E7D4E]" />
                قرار المراجعة
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setReviewAction("approve")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                      reviewAction === "approve"
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    اعتماد المتجر
                  </button>
                  <button
                    onClick={() => setReviewAction("request_changes")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                      reviewAction === "request_changes"
                        ? "bg-orange-600 text-white"
                        : "bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400"
                    }`}
                  >
                    <AlertCircle className="w-5 h-5" />
                    طلب تعديلات
                  </button>
                  <button
                    onClick={() => setReviewAction("reject")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                      reviewAction === "reject"
                        ? "bg-red-600 text-white"
                        : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    رفض الطلب
                  </button>
                </div>

                {(reviewAction === "reject" || reviewAction === "request_changes") && (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      سبب {reviewAction === "reject" ? "الرفض" : "طلب التعديلات"} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1E7D4E]"
                      placeholder={`يرجى كتابة سبب ${reviewAction === "reject" ? "الرفض" : "طلب التعديلات"} بالتفصيل ليتمكن المندوب من مراجعته...`}
                    ></textarea>
                  </div>
                )}

                {reviewAction && (
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : null}
                      تأكيد وحفظ الإجراء
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1E7D4E]" />
              صاحب المتجر (التاجر)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">الاسم</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{requestData.proposed_merchant_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1" dir="ltr">{requestData.proposed_merchant_phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{requestData.proposed_merchant_email || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1E7D4E]" />
              المندوب صاحب الطلب
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center text-[#1E7D4E] dark:text-[#EAF3EC] font-bold text-lg">
                {(requestData.representative?.name || requestData.representative?.first_name || "?").charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                  {requestData.representative?.name ||
                    [requestData.representative?.first_name, requestData.representative?.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                    "غير متوفر"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">
                  {requestData.representative?.phone || "—"}
                </p>
              </div>
            </div>
            {requestData.representative_notes && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg text-sm text-gray-700 dark:text-gray-300">
                <span className="block font-medium mb-1 text-gray-500">ملاحظات المندوب:</span>
                {requestData.representative_notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
