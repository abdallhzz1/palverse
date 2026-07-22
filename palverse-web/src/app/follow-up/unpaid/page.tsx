"use client";

import { useEffect, useState } from "react";
import { Store, Phone, Calendar, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { followUpService } from "@/services/followUp.service";
import { apiClient } from "@/lib/api/client";

export default function FollowUpUnpaidPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchUnpaid = async () => {
    setIsLoading(true);
    try {
      const res = await followUpService.getUnpaidSubscriptions(1);
      setSubscriptions(res.data.data || res.data || []);
    } catch (error) {
      console.error("Failed to load unpaid subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaid();
  }, []);

  const handlePay = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من تأكيد استلام الدفعة وتفعيل هذا الاشتراك؟")) return;
    
    setIsProcessing(publicId);
    try {
      await apiClient.put(`/follow-up/unpaid-subscriptions/${publicId}/pay`, {});
      await fetchUnpaid();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      alert("حدث خطأ أثناء تأكيد الدفع.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الاشتراك؟ (سيتم إلغاء وصول التاجر لمنصته)")) return;
    
    setIsProcessing(publicId);
    try {
      await apiClient.put(`/follow-up/unpaid-subscriptions/${publicId}/cancel`, {});
      await fetchUnpaid();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("حدث خطأ أثناء إلغاء الاشتراك.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">المتاجر غير المسددة</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            متابعة المتاجر التي لم تسدد رسوم اشتراكاتها بالكامل، مع إمكانية تأكيد الدفع والتفعيل.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252525] border-b border-[#EAF3EC] dark:border-[#1F2522]">
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">المتجر</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الباقة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">تاريخ البدء</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">حالة الدفع</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  return (
                    <tr key={sub.public_id} className="border-b border-gray-100 dark:border-[#1F2522] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC]">{sub.store?.name_ar}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span dir="ltr">{sub.store?.phone}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{sub.plan?.name_ar}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(sub.starts_at).toLocaleDateString('ar-SA')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          بانتظار الدفع (غير مسدد)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePay(sub.public_id)}
                            disabled={isProcessing === sub.public_id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#1E7D4E] text-white rounded-lg text-sm font-medium hover:bg-[#0F3D2E] transition-colors disabled:opacity-50 tooltip"
                            title="تأكيد تحصيل المبلغ وتفعيل الاشتراك"
                          >
                            <CheckCircle className="w-4 h-4" />
                            تأكيد الدفع
                          </button>
                          <button
                            onClick={() => handleCancel(sub.public_id)}
                            disabled={isProcessing === sub.public_id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 tooltip"
                            title="إلغاء الاشتراك نهائياً"
                          >
                            <XCircle className="w-4 h-4" />
                            إلغاء
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">لا يوجد متاجر غير مسددة</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              جميع الاشتراكات مسددة بالكامل.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
