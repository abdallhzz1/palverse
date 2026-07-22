"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Store, ArrowRight, Send, AlertTriangle, User, MapPin, Phone, Tag } from "lucide-react";
import Link from "next/link";
import { RepresentativeService } from "@/services/representative.service";
import type { StoreRegistrationRequest } from "@/types/representative";

export default function StoreRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<StoreRegistrationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await RepresentativeService.getStoreRequest(params.publicId as string);
        setRequest(res.data);
      } catch (err) {
        console.error("Failed to load request:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.publicId) fetchRequest();
  }, [params.publicId]);

  const handleSubmit = async () => {
    if (!confirm("هل أنت متأكد من تقديم الطلب للمراجعة؟ لا يمكنك تعديل الطلب بعد التقديم.")) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await RepresentativeService.submitStoreRequest(request!.public_id);
      // Reload request
      const res = await RepresentativeService.getStoreRequest(request!.public_id);
      setRequest(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تقديم الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold">الطلب غير موجود</h2>
        <Link href="/representative/store-requests" className="text-[#1E7D4E] hover:underline mt-4 inline-block">العودة للطلبات</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-[#171717] rounded-lg border border-[#EAF3EC] dark:border-[#1F2522] hover:bg-gray-50 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تفاصيل الطلب: {request.store_name_ar}</h1>
          <p className="text-gray-500 mt-1">رقم الطلب: {request.public_id}</p>
        </div>
        <div className="mr-auto flex items-center gap-3">
          {(request.status === 'draft' || request.status === 'needs_changes' || request.status === 'rejected') && (
            <Link 
              href={`/representative/store-requests/${request.public_id}/edit`}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg font-medium transition-colors"
            >
              تعديل الطلب
            </Link>
          )}
          <span className={`px-4 py-2 rounded-lg font-bold ${getStatusColor(request.status)}`}>
            {request.status_label_ar}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {(request.status === 'rejected' || request.status === 'needs_changes') && request.rejection_reason && (
         <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl">
           <h3 className="text-red-800 dark:text-red-400 font-bold mb-2 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5" />
             ملاحظات الإدارة:
           </h3>
           <p className="text-red-700 dark:text-red-300 mb-4">{request.rejection_reason}</p>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2 flex items-center gap-2">
              <Store className="w-5 h-5 text-[#1E7D4E]" />
              بيانات المتجر
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">اسم المتجر (عربي)</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">{request.store_name_ar}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">اسم المتجر (إنجليزي)</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">{request.store_name_en || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">وصف المتجر</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">{request.description_ar || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">العنوان</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1E7D4E]" />
                  {request.address_ar}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">المنطقة الجغرافية</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">{request.zone?.name_ar}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">التصنيف</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#1E7D4E]" />
                  {request.category?.name_ar || 'غير محدد'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC] flex items-center gap-2" dir="ltr">
                  <Phone className="w-4 h-4 text-[#1E7D4E]" />
                  {request.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1E7D4E]" />
              بيانات التاجر
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">اسم التاجر المقترح</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">{request.proposed_merchant_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">رقم الجوال</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]" dir="ltr">{request.proposed_merchant_phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                <p className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">{request.proposed_merchant_email || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          {(request.status === 'draft' || request.status === 'needs_changes' || request.status === 'rejected') && (
            <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-6 space-y-4">
              <h2 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">الإجراءات</h2>
              <p className="text-sm text-gray-500">
                الطلب حالياً مسودة. يجب تقديمه للمراجعة لكي يتم اعتماده من الإدارة.
              </p>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    تقديم الطلب للمراجعة
                  </>
                )}
              </button>
            </div>
          )}

          {/* Timeline */}
          {request.status_history && request.status_history.length > 0 && (
            <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-6">
              <h2 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4">سجل الطلب</h2>
              <div className="relative border-r-2 border-[#EAF3EC] dark:border-[#1F2522] pr-4 space-y-6">
                {request.status_history.map((history, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute w-3 h-3 bg-[#1E7D4E] rounded-full -right-[23px] top-1 border-2 border-white dark:border-[#171717]"></div>
                    <p className="font-semibold text-sm text-[#0F3D2E] dark:text-[#EAF3EC]">
                      تغيرت الحالة إلى: {(history as any).to_status_label_ar || history.to_status}
                    </p>
                    {history.note && <p className="text-sm text-gray-500 mt-1">{history.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(history.created_at).toLocaleString('ar-SA')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
