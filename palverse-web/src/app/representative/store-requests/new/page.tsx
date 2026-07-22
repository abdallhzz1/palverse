"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, Store, X, Save, Send } from "lucide-react";
import LocationPicker from "@/components/map/LocationPicker";
import { RepresentativeService } from "@/services/representative.service";
import { publicService } from "@/services/public.service";
import type { RepresentativeZone } from "@/types/representative";

export default function NewStoreRequestPage() {
  const router = useRouter();
  const [zones, setZones] = useState<RepresentativeZone[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    zone_public_id: "",
    city_public_id: "", // Will be derived from selected zone
    category_public_id: "",
    latitude: null as number | null,
    longitude: null as number | null,
    proposed_merchant_name: "",
    proposed_merchant_phone: "",
    proposed_merchant_email: "",
    store_name_ar: "",
    store_name_en: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address_ar: "",
    description_ar: "",
    description_en: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, categoriesRes] = await Promise.all([
          RepresentativeService.getZones(),
          publicService.getCategories()
        ]);
        setZones(zonesRes.data);
        
        const cats = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "zone_public_id") {
      const selectedZone = zones.find(z => z.zone.public_id === value);
      if (selectedZone) {
        setFormData((prev) => ({ ...prev, city_public_id: selectedZone.zone.city.public_id }));
      }
    }
  };

  const handleSaveDraft = async () => {
    setError(null);
    setFieldErrors({});
    setIsLoading(true);
    try {
      // filter out empty strings to prevent validation issues on nullable fields if needed, or let Laravel handle it
      const payload = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, v === "" ? null : v]));
      
      const res = await RepresentativeService.createStoreRequest(payload as any);
      router.push(`/representative/store-requests/${res.data.public_id}`);
    } catch (err: any) {
      const errorData = err.data || err.response?.data;
      if (errorData?.errors) {
        setFieldErrors(errorData.errors);
        setError("يرجى تصحيح الأخطاء في النموذج");
      } else {
        setError(errorData?.message || "حدث خطأ أثناء حفظ المسودة");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تسجيل متجر جديد</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          قم بإدخال بيانات التاجر والمتجر لإنشاء مسودة طلب تسجيل.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{error}</p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="list-disc list-inside mt-2 text-sm">
                {Object.entries(fieldErrors).map(([field, msgs]) => (
                  <li key={field}>{msgs[0]}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Section 1: Merchant Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">
              بيانات التاجر المقترح
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم التاجر المقترح *</label>
                <input
                  type="text"
                  name="proposed_merchant_name"
                  value={formData.proposed_merchant_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم جوال التاجر *</label>
                <input
                  type="tel"
                  name="proposed_merchant_phone"
                  value={formData.proposed_merchant_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني للتاجر (اختياري)</label>
                <input
                  type="email"
                  name="proposed_merchant_email"
                  value={formData.proposed_merchant_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Store Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">
              بيانات المتجر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم المحل المقترح *</label>
                <input
                  type="text"
                  name="store_name_ar"
                  value={formData.store_name_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم الهاتف *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم الواتساب (اختياري)</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع الإلكتروني (اختياري)</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>
              
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
                <p className="text-xs text-gray-500">تظهر هنا فقط المناطق المخصصة لك.</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">التصنيف (اختياري)</label>
                <select
                  name="category_public_id"
                  value={formData.category_public_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                >
                  <option value="">-- اختر التصنيف --</option>
                  {categories.map((c) => (
                    <option key={c.public_id} value={c.public_id}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">العنوان بالتفصيل *</label>
                <input
                  type="text"
                  name="address_ar"
                  value={formData.address_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع على الخريطة</label>
                <LocationPicker 
                  latitude={formData.latitude} 
                  longitude={formData.longitude} 
                  onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">وصف موجز للمتجر (عربي) (اختياري)</label>
                <textarea
                  name="description_ar"
                  value={formData.description_ar}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">وصف موجز للمتجر (إنجليزي) (اختياري)</label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
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
            onClick={handleSaveDraft}
            disabled={isLoading || !formData.proposed_merchant_name || !formData.store_name_ar || !formData.zone_public_id}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ كمسودة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
