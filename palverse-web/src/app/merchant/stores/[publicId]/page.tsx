"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, Store, Tag, Link as LinkIcon, ExternalLink } from "lucide-react";
import { merchantService } from "@/services/merchant.service";
import type { StoreDashboardData } from "@/types/merchant";

export default function StoreDashboardPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<StoreDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    merchantService.getStoreDashboard(resolvedParams.publicId)
      .then(res => setData(res))
      .catch(err => {
        console.error(err);
        if (err.status === 403) {
          setError("غير مصرح لك بالوصول إلى هذا المحل.");
        } else {
          setError("حدث خطأ أثناء جلب بيانات المحل.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [resolvedParams.publicId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500 font-bold">{error || "حدث خطأ أثناء جلب بيانات المحل."}</div>;
  }

  const { store_status, subscription, offers, profile_completion, public_readiness } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
          {store_status.name_ar}
        </h1>
        {store_status.web_url && store_status.is_publicly_visible && (
          <a
            href={store_status.web_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#1E7D4E] font-bold hover:underline"
          >
            عرض المحل للعامة
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {store_status.approval_status === "rejected" && store_status.rejection_reason && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-bold">تم رفض طلب اعتماد المحل</h3>
              <p className="text-red-700 mt-1">{store_status.rejection_reason}</p>
              <p className="text-red-600 text-sm mt-2">
                يرجى تصحيح الملاحظات المذكورة وتحديث بيانات المحل. سيتم إعادة إرسال المحل للمراجعة تلقائياً بمجرد التعديل.
              </p>
            </div>
          </div>
        </div>
      )}

      {store_status.approval_status === "pending" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-yellow-800 font-bold">المحل قيد المراجعة</h3>
              <p className="text-yellow-700 mt-1 text-sm">
                يقوم فريقنا حالياً بمراجعة بيانات محلك. سيتم إشعارك فور اعتماد المحل.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">حالة المحل</h3>
          <div className="flex items-center gap-3">
            {store_status.approval_status === "approved" && <CheckCircle className="w-8 h-8 text-green-500" />}
            {store_status.approval_status === "pending" && <Clock className="w-8 h-8 text-yellow-500" />}
            {store_status.approval_status === "rejected" && <AlertCircle className="w-8 h-8 text-red-500" />}
            {store_status.approval_status === "suspended" && <AlertCircle className="w-8 h-8 text-gray-500" />}
            
            <div>
              <p className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                {store_status.approval_status === "approved" ? "معتمد" : 
                 store_status.approval_status === "pending" ? "قيد المراجعة" :
                 store_status.approval_status === "rejected" ? "مرفوض" : "موقوف"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {store_status.is_publicly_visible ? "يظهر للعامة" : "لا يظهر للعامة"}
              </p>
            </div>
          </div>
        </div>

        {/* Completeness Card */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">اكتمال الملف</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100 dark:text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#1E7D4E]" strokeDasharray={`${profile_completion.percentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-sm font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{profile_completion.percentage}%</span>
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                {public_readiness.ready ? "جاهز للعرض" : "يحتاج بيانات"}
              </p>
              {(profile_completion.total - profile_completion.completed) > 0 && (
                <p className="text-sm text-red-500 mt-1">ينقصك {profile_completion.total - profile_completion.completed} حقول مهمة</p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">الاشتراك الحالي</h3>
          {subscription.has_active_subscription ? (
            <div>
              <p className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                {subscription.current_subscription?.plan_name_ar || "باقة نشطة"}
              </p>
              <p className={`text-sm mt-2 font-bold ${subscription.expiring_soon ? "text-yellow-600" : "text-[#1E7D4E]"}`}>
                متبقي {subscription.days_remaining} يوم
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-bold text-red-500">لا يوجد اشتراك نشط</p>
              <Link href={`/merchant/stores/${resolvedParams.publicId}/subscription`} className="text-sm text-[#1E7D4E] hover:underline mt-2 inline-block">
                متابعة الاشتراك
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
        <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6">ملخص العروض</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">إجمالي العروض</p>
            <p className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{offers.total_offers}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">عروض فعالة حالياً</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500">{offers.currently_valid_offers}</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium mb-1">مجدولة</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{offers.scheduled_offers}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">عروض منتهية</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{offers.expired_offers}</p>
          </div>
        </div>
        <div className="mt-6 text-left" dir="ltr">
           <Link href={`/merchant/stores/${resolvedParams.publicId}/offers`} className="inline-flex items-center gap-2 px-5 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors">
              <Tag className="w-4 h-4" />
              إدارة العروض
           </Link>
        </div>
      </div>
    </div>
  );
}
