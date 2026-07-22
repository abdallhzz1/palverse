"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileX, Save, AlertTriangle } from "lucide-react";
import { RepresentativeService } from "@/services/representative.service";
import type { RepresentativeZone } from "@/types/representative";

export default function NewRejectionReportPage() {
  const router = useRouter();
  const [zones, setZones] = useState<RepresentativeZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    zone_public_id: "",
    business_name: "",
    owner_name: "",
    phone: "",
    refusal_reason_code: "",
    refusal_reason_text: "",
    contacted_at: new Date().toISOString().split('T')[0],
    follow_up_required: false,
    notes: "",
  });

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await RepresentativeService.getZones();
        setZones(res.data);
      } catch (err) {
        console.error("Failed to load zones", err);
      }
    };
    fetchZones();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await RepresentativeService.createRejectionReport({
        ...formData,
        refusal_reason_code: formData.refusal_reason_code as any
      });
      router.push("/representative/rejection-reports");
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء حفظ التقرير");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تسجيل تقرير رفض (زيارة غير ناجحة)</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          قم بتوثيق تفاصيل الزيارة التي لم ينتج عنها اشتراك في المنصة.
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">المنطقة الجغرافية *</label>
                <select
                  name="zone_public_id"
                  value={formData.zone_public_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                >
                  <option value="">-- اختر المنطقة المخصصة --</option>
                  {zones.map((z) => (
                    <option key={z.zone.public_id} value={z.zone.public_id}>
                      {z.zone.name_ar} ({z.zone.city.name_ar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم النشاط التجاري *</label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم صاحب النشاط (اختياري)</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم التواصل (اختياري)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1 md:col-span-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ الزيارة *</label>
                <input
                  type="date"
                  name="contacted_at"
                  value={formData.contacted_at}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">سبب الرفض *</label>
                <select
                  name="refusal_reason_code"
                  value={formData.refusal_reason_code}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                >
                  <option value="">-- اختر السبب --</option>
                  <option value="price">السعر مرتفع</option>
                  <option value="not_interested">غير مهتم</option>
                  <option value="already_subscribed">مشترك بالفعل</option>
                  <option value="needs_more_information">يحتاج معلومات أكثر</option>
                  <option value="contact_later">يرجى التواصل لاحقاً</option>
                  <option value="trust_concern">مخاوف من الثقة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              {formData.refusal_reason_code === 'other' && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">تفاصيل السبب (مطلوب) *</label>
                  <textarea
                    name="refusal_reason_text"
                    value={formData.refusal_reason_text}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                    required
                  />
                </div>
              )}

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات عامة عن الزيارة</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 dark:bg-[#252525] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="follow_up_required"
                  name="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#1E7D4E] bg-white border-gray-300 rounded focus:ring-[#1E7D4E]"
                />
                <label htmlFor="follow_up_required" className="text-sm font-bold text-[#0F3D2E] dark:text-[#EAF3EC] cursor-pointer">
                  هل يحتاج التاجر لمتابعة لاحقة؟ (مثلاً: طلب التواصل بعد أسبوع)
                </label>
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
            disabled={isLoading || !formData.business_name || !formData.zone_public_id || !formData.refusal_reason_code || (formData.refusal_reason_code === 'other' && !formData.refusal_reason_text)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FileX className="w-5 h-5" />
                حفظ التقرير
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
