"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Save, AlertTriangle } from "lucide-react";
import { RepresentativeService } from "@/services/representative.service";
import type { StoreRegistrationRequest } from "@/types/representative";

export default function NewReceiptPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<StoreRegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    store_registration_request_public_id: "",
    amount: "",
    currency: "ILS",
    payment_purpose: "subscription",
    notes: "",
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await RepresentativeService.getStoreRequests(1);
        // Only get approved or submitted requests where a store might have paid
        setRequests(res.data.filter(r => ['submitted', 'under_review', 'approved'].includes(r.status)));
      } catch (err) {
        console.error("Failed to load requests", err);
      }
    };
    fetchRequests();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const payload: any = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        payment_purpose: formData.payment_purpose,
        collected_at: new Date().toISOString().split('T')[0], // Add required collected_at field
      };

      if (formData.store_registration_request_public_id) {
        payload.store_registration_request_public_id = formData.store_registration_request_public_id;
      }

      if (formData.notes) {
        payload.notes = formData.notes;
      }

      await RepresentativeService.createReceipt(payload);
      router.push("/representative/receipts");
    } catch (err: any) {
      console.log("Error object:", err);
      if (err.data?.errors) {
        const firstError = Object.values(err.data.errors)[0] as string[];
        setError(firstError[0]);
      } else {
        setError(err.data?.message || err.message || "حدث خطأ أثناء حفظ السند");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تسجيل سند قبض جديد</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          إصدار سند قبض للمبالغ المحصلة من التاجر نداً.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        <div className="p-6 space-y-8">
          
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">طلب التسجيل / المتجر المربوط (اختياري)</label>
                <select
                  name="store_registration_request_public_id"
                  value={formData.store_registration_request_public_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                >
                  <option value="">-- بدون ربط مباشر بطلب --</option>
                  {requests.map((r) => (
                    <option key={r.public_id} value={r.public_id}>
                      {r.store_name_ar} - {r.proposed_merchant_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">يفضل ربط السند بطلب التسجيل لتسهيل المراجعة من الإدارة.</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">المبلغ المحصل *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">العملة *</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                >
                  <option value="ILS">شيكل إسرائيلي (ILS)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="JOD">دينار أردني (JOD)</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">غرض الدفع *</label>
                <select
                  name="payment_purpose"
                  value={formData.payment_purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                >
                  <option value="subscription">رسوم اشتراك متجر</option>
                  <option value="registration_fee">رسوم تسجيل وبدء تشغيل</option>
                  <option value="other">أخرى / تحصيلات عامة</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات (اختياري)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                />
              </div>

            </div>
          </section>

        </div>
        <div className="p-6 bg-gray-50 dark:bg-[#1A1A1A] border-t border-[#EAF3EC] dark:border-[#1F2522] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.amount || !formData.payment_purpose}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                إصدار السند
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
