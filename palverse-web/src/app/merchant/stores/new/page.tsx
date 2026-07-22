"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { merchantService } from "@/services/merchant.service";
import { publicService } from "@/services/public.service";
import LocationPicker from "@/components/map/LocationPicker";

export default function NewStorePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address_ar: "",
    address_en: "",
    latitude: null as number | null,
    longitude: null as number | null,
    category_public_id: "",
    city_public_id: "",
    zone_public_id: "",
  });

  const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  useEffect(() => {
    Promise.all([
      publicService.getCategories(),
      publicService.getCities()
    ]).then(([catsRes, citiesRes]) => {
      setCategories(extractArray(catsRes));
      setCities(extractArray(citiesRes));
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.city_public_id) {
      publicService.getZones(formData.city_public_id).then(res => {
        setZones(extractArray(res));
      }).catch(() => setZones([]));
    } else {
      setZones([]);
    }
  }, [formData.city_public_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === "") {
          (payload as any)[key] = null;
        }
      });

      const res = await merchantService.createStore(payload);
      router.push(`/merchant/stores/${res.public_id}`);
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setError(err.data.errors[firstErrorKey][0]);
      } else {
        setError(err.message || "حدث خطأ أثناء الإنشاء.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/merchant/stores" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowRight className="w-6 h-6 text-[#0F3D2E] dark:text-[#EAF3EC]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
            إضافة محل جديد
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            أدخل تفاصيل المحل لإرساله للمراجعة.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#171717] rounded-2xl p-6 md:p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">البيانات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المحل (بالعربية) *</label>
              <input type="text" required value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المحل (بالإنجليزية)</label>
              <input type="text" dir="ltr" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف المحل (بالعربية) *</label>
              <textarea required rows={3} value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف المحل (بالإنجليزية)</label>
              <textarea rows={3} dir="ltr" value={formData.description_en} onChange={e => setFormData({ ...formData, description_en: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">معلومات التواصل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
              <input type="tel" dir="ltr" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الواتساب</label>
              <input type="tel" dir="ltr" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
              <input type="email" dir="ltr" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموقع الإلكتروني</label>
              <input type="url" dir="ltr" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">الموقع والتصنيف</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف *</label>
              <select required value={formData.category_public_id} onChange={e => setFormData({ ...formData, category_public_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]">
                <option value="">اختر التصنيف</option>
                {categories.map(c => <option key={c.public_id} value={c.public_id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدينة *</label>
              <select required value={formData.city_public_id} onChange={e => setFormData({ ...formData, city_public_id: e.target.value, zone_public_id: "" })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]">
                <option value="">اختر المدينة</option>
                {cities.map(c => <option key={c.public_id} value={c.public_id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنطقة *</label>
              <select 
                required 
                disabled={!formData.city_public_id || zones.length === 0} 
                value={formData.zone_public_id} 
                onChange={e => setFormData({ ...formData, zone_public_id: e.target.value })} 
                className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.city_public_id ? "اختر المدينة أولاً" : (zones.length === 0 ? "لا يوجد مناطق (أو جاري التحميل...)" : "اختر المنطقة")}
                </option>
                {zones.map(z => <option key={z.public_id} value={z.public_id}>{z.name_ar}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان التفصيلي (بالعربية) *</label>
              <input type="text" required value={formData.address_ar} onChange={e => setFormData({ ...formData, address_ar: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموقع على الخريطة</label>
              <LocationPicker 
                latitude={formData.latitude} 
                longitude={formData.longitude} 
                onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 p-4 rounded-xl flex items-start gap-3">
          <Store className="w-6 h-6 text-[#1E7D4E] mt-0.5" />
          <p className="text-sm text-[#0F3D2E] dark:text-[#EAF3EC]">
            <strong>ملاحظة هامة:</strong> بمجرد الحفظ، سيتم إرسال بيانات المحل مباشرة للمراجعة. تأكد من إدخال البيانات الصحيحة وتحديث الصور لاحقاً إن لزم الأمر.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#EAF3EC] dark:border-[#1F2522]">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                إنشاء وإرسال للمراجعة
                <CheckCircle className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
