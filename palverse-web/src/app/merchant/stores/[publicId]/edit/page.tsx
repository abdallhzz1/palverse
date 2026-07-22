"use client";

import { useEffect, useState, use } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { merchantService } from "@/services/merchant.service";
import { publicService } from "@/services/public.service";
import LocationPicker from "@/components/map/LocationPicker";

export default function StoreEditPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

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
    category_public_id: "",
    city_public_id: "",
    zone_public_id: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch store first (critical - if this fails we can't proceed)
        const storeRes = await merchantService.getStore(resolvedParams.publicId);
        const storeData = storeRes;
        setIsRejected(storeData.status === "rejected");

        setFormData({
          name_ar: storeData.name_ar || "",
          name_en: storeData.name_en || "",
          description_ar: storeData.description_ar || "",
          description_en: storeData.description_en || "",
          phone: storeData.phone || "",
          whatsapp: storeData.whatsapp || "",
          email: storeData.email || "",
          website: storeData.website || "",
          address_ar: storeData.address_ar || "",
          address_en: storeData.address_en || "",
          category_public_id: storeData.category?.public_id || "",
          city_public_id: storeData.city?.public_id || "",
          zone_public_id: storeData.zone?.public_id || "",
          latitude: storeData.latitude || null,
          longitude: storeData.longitude || null,
        });

        // Fetch categories and cities independently (non-critical, fail gracefully)
        const [catsRes, citiesRes] = await Promise.allSettled([
          publicService.getCategories(),
          publicService.getCities(),
        ]);

        if (catsRes.status === "fulfilled") {
          const catsData = catsRes.value;
          setCategories(Array.isArray(catsData) ? catsData : (catsData as any)?.data || []);
        } else {
          console.warn("Failed to load categories:", catsRes.reason);
        }

        if (citiesRes.status === "fulfilled") {
          const citiesData = citiesRes.value;
          setCities(Array.isArray(citiesData) ? citiesData : (citiesData as any)?.data || []);
        } else {
          console.warn("Failed to load cities:", citiesRes.reason);
        }

      } catch (err) {
        console.error("Failed to load store data:", err);
        setError("فشل في تحميل بيانات المحل.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams.publicId]);

  useEffect(() => {
    if (formData.city_public_id) {
      publicService.getZones(formData.city_public_id).then(res => {
        // res is already the unwrapped data (array or object with data property)
        setZones(Array.isArray(res) ? res : (res as any)?.data || []);
      }).catch(() => setZones([]));
    } else {
      setZones([]);
    }
  }, [formData.city_public_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = { ...formData };
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === "") {
          (payload as any)[key] = null;
        }
      });

      await merchantService.updateStore(resolvedParams.publicId, payload);
      setSuccess(true);
      
      if (isRejected) {
        setIsRejected(false); // It changes to pending backend-side
      }
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setError(err.data.errors[firstErrorKey][0]);
      } else {
        setError(err.message || "حدث خطأ أثناء التحديث.");
      }
    } finally {
      setIsSaving(false);
      window.scrollTo(0, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
          تحديث بيانات المحل
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#171717] rounded-2xl p-6 md:p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-bold border border-green-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            تم تحديث بيانات المحل بنجاح!
          </div>
        )}

        {isRejected && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm font-bold border border-yellow-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-600" />
            <div>
              <p>تنبيه: هذا المحل مرفوض حالياً.</p>
              <p className="font-normal mt-1">تعديلك للبيانات وحفظها سيؤدي إلى إعادة إرسال المحل للمراجعة تلقائياً.</p>
            </div>
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
              <select required value={formData.city_public_id} onChange={e => setFormData({ ...formData, city_public_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]">
                <option value="">اختر المدينة</option>
                {cities.map(c => <option key={c.public_id} value={c.public_id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنطقة *</label>
              <select required disabled={!formData.city_public_id} value={formData.zone_public_id} onChange={e => setFormData({ ...formData, zone_public_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]">
                <option value="">اختر المنطقة</option>
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

        <div className="flex justify-end pt-4 border-t border-[#EAF3EC] dark:border-[#1F2522]">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "حفظ التعديلات"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
