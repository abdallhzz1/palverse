"use client";

import { useEffect, useState } from "react";
import { Store, Phone, Calendar, RefreshCcw, XCircle, X, CreditCard } from "lucide-react";
import { followUpService } from "@/services/followUp.service";
import { apiClient } from "@/lib/api/client";

export default function FollowUpRenewalsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Renew Modal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [renewForm, setRenewForm] = useState({ subscription_plan_id: "" });
  const [renewError, setRenewError] = useState<string | null>(null);

  const TABS = [
    { id: 'all', label: 'الجميع' },
    { id: 'expiring_soon', label: 'توشك على الانتهاء' },
    { id: 'expired', label: 'منتهية' },
  ];

  const fetchRenewals = async () => {
    setIsLoading(true);
    try {
      const res = await followUpService.getRenewals(1, { status_filter: statusFilter === 'all' ? undefined : statusFilter });
      setSubscriptions(res.data.data || res.data || []);
    } catch (error) {
      console.error("Failed to load renewals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get(`/subscription-plans`);
      setPlans(res.data || []);
    } catch (error) {
      console.error("Failed to load plans", error);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, [statusFilter]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCancel = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء/إيقاف هذا الاشتراك؟")) return;
    
    setIsProcessing(publicId);
    try {
      await apiClient.put(`/follow-up/renewals/${publicId}/cancel`, {});
      await fetchRenewals();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("حدث خطأ أثناء إيقاف الاشتراك.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleOpenRenewModal = (sub: any) => {
    setSelectedSub(sub);
    setRenewForm({ subscription_plan_id: sub.plan?.public_id || "" });
    setRenewError(null);
    setIsRenewModalOpen(true);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    
    setIsProcessing(selectedSub.public_id);
    setRenewError(null);

    try {
      await apiClient.post(`/follow-up/renewals/${selectedSub.public_id}/renew`, {
        subscription_plan_id: renewForm.subscription_plan_id,
      });
      setIsRenewModalOpen(false);
      fetchRenewals();
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setRenewError(err.data.errors[firstErrorKey][0]);
      } else {
        setRenewError(err.message || "حدث خطأ غير متوقع.");
      }
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تجديدات الاشتراكات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            متابعة وتجديد الاشتراكات المنتهية أو التي توشك على الانتهاء.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        <div className="p-4 border-b border-[#EAF3EC] dark:border-[#1F2522] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  statusFilter === tab.id
                    ? "bg-[#1E7D4E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#252525] dark:text-gray-400 dark:hover:bg-[#333]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

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
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الباقة السابقة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">تاريخ الانتهاء</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const isExpired = new Date(sub.ends_at) < new Date() || sub.status === 'expired';
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
                          {new Date(sub.ends_at).toLocaleDateString('ar-SA')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isExpired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            منتهية
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            توشك على الانتهاء
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenRenewModal(sub)}
                            disabled={isProcessing === sub.public_id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#1E7D4E] text-white rounded-lg text-sm font-medium hover:bg-[#0F3D2E] transition-colors disabled:opacity-50 tooltip"
                            title="تجديد الاشتراك للمتجر"
                          >
                            <RefreshCcw className="w-4 h-4" />
                            تجديد
                          </button>
                          <button
                            onClick={() => handleCancel(sub.public_id)}
                            disabled={isProcessing === sub.public_id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 tooltip"
                            title="إلغاء الاشتراك"
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
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">لا توجد اشتراكات</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              لم يتم العثور على اشتراكات بهذا التصنيف حالياً.
            </p>
          </div>
        )}
      </div>

      {/* Renew Modal */}
      {isRenewModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#171717] w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#1F2522]">
              <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تجديد اشتراك المتجر</h3>
              <button 
                onClick={() => setIsRenewModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRenewSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm mb-4">
                سيتم تجديد اشتراك متجر <strong>{selectedSub.store?.name_ar}</strong> بدءاً من نهاية اشتراكه الحالي (أو من اليوم إذا كان منتهياً).
              </div>

              {renewError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                  {renewError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الباقة للتجديد *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    required
                    value={renewForm.subscription_plan_id}
                    onChange={(e) => setRenewForm({ ...renewForm, subscription_plan_id: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                  >
                    <option value="">اختر باقة التجديد</option>
                    {plans.map((plan) => (
                      <option key={plan.public_id} value={plan.public_id}>
                        {plan.name_ar} - {plan.price > 0 ? `${plan.price} شيقل / ${plan.duration_days} يوم` : 'مجانية'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessing === selectedSub.public_id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-bold disabled:opacity-50"
                >
                  {isProcessing === selectedSub.public_id ? "جاري التجديد..." : (
                    <>
                      <RefreshCcw className="w-4 h-4" />
                      تأكيد التجديد
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
