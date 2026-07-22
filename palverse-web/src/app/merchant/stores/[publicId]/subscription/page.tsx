"use client";

import { useEffect, useState, use, useMemo } from "react";
import { CheckCircle, AlertTriangle, CreditCard, Calendar, ShieldCheck } from "lucide-react";
import { merchantService } from "@/services/merchant.service";

export default function StoreSubscriptionPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    merchantService.getSubscription(resolvedParams.publicId)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [resolvedParams.publicId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">لا توجد بيانات للاشتراك</h3>
        <p className="text-gray-600 dark:text-gray-400">
          لم نتمكن من العثور على بيانات الاشتراك لهذا المحل.
        </p>
      </div>
    );
  }

  // Backend shape: { has_active_subscription, public_visibility_allowed, subscription: { ... } }
  const { has_active_subscription, subscription } = data;

  // Compute days remaining from subscription.ends_at if available
  const daysRemaining = subscription?.ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.ends_at).getTime() - now) / 86400000))
    : 0;
  const expiringSoon = has_active_subscription && daysRemaining > 0 && daysRemaining <= 7;

  // Prefer snapshot name (always present even after plan changes), fall back to live plan name
  const planNameAr =
    subscription?.plan_name_ar_snapshot ||
    subscription?.plan?.name_ar ||
    "باقة نشطة";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">حالة الاشتراك</h1>

      {!has_active_subscription ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600 mt-1" />
          <div>
            <h2 className="text-lg font-bold text-red-800">لا يوجد اشتراك نشط</h2>
            <p className="text-red-700 mt-2">
              محلك حالياً لا يملك اشتراكاً فعالاً، مما يعني أنه لن يظهر في نتائج البحث أو للعامة في المنصة. يرجى التواصل مع الإدارة لتجديد أو تفعيل اشتراكك.
            </p>
          </div>
        </div>
      ) : expiringSoon ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-xl flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600 mt-1" />
          <div>
            <h2 className="text-lg font-bold text-yellow-800">اشتراكك يشارف على الانتهاء</h2>
            <p className="text-yellow-700 mt-2">
              يتبقى {daysRemaining} يوم فقط على انتهاء اشتراكك الحالي. يرجى تجديد الاشتراك لضمان استمرار ظهور محلك للعامة دون انقطاع.
            </p>
          </div>
        </div>
      ) : null}

      {subscription && (
        <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
          <div className="bg-[#0F3D2E] p-6 text-white flex items-center justify-between">
            <div>
              <p className="text-[#7FA789] text-sm mb-1">الباقة الحالية</p>
              <h2 className="text-2xl font-bold">{planNameAr}</h2>
            </div>
            <ShieldCheck className="w-12 h-12 text-[#1E7D4E]" />
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 dark:bg-[#252525] rounded-full flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ البدء</p>
                <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                  {subscription.starts_at
                    ? new Date(subscription.starts_at).toLocaleDateString("ar-SA")
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 dark:bg-[#252525] rounded-full flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-[#1E7D4E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الانتهاء</p>
                <p className={`font-bold ${expiringSoon ? "text-yellow-600" : "text-[#0F3D2E] dark:text-[#EAF3EC]"}`}>
                  {subscription.ends_at
                    ? new Date(subscription.ends_at).toLocaleDateString("ar-SA")
                    : "—"}
                </p>
              </div>
            </div>

            {has_active_subscription && daysRemaining > 0 && (
              <div className="md:col-span-2">
                <p className={`text-sm font-bold ${expiringSoon ? "text-yellow-600" : "text-[#1E7D4E]"}`}>
                  متبقي {daysRemaining} يوم على انتهاء الاشتراك
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
        <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4">مميزات الاشتراك النشط</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#1E7D4E]" />
            <span className="text-gray-700 dark:text-gray-300">ظهور المحل في نتائج البحث وتصفح الأقسام</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#1E7D4E]" />
            <span className="text-gray-700 dark:text-gray-300">إمكانية إضافة ونشر العروض الخاصة والتخفيضات</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#1E7D4E]" />
            <span className="text-gray-700 dark:text-gray-300">تفاعل مباشر مع العملاء وتقييماتهم</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#1E7D4E]" />
            <span className="text-gray-700 dark:text-gray-300">تحديث مستمر للبيانات وساعات العمل وروابط التواصل</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 p-6 rounded-xl text-center">
        <p className="text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 font-bold">
          هل تحتاج إلى ترقية باقتك أو تجديد اشتراكك؟
        </p>
        <p className="text-[#1E7D4E] dark:text-[#7FA789] text-sm">
          يرجى التواصل مع الدعم الفني لإتمام عملية التجديد المالي.
        </p>
      </div>
    </div>
  );
}
