"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Store, MapPin, Phone, CheckCircle } from "lucide-react";
import { merchantService } from "@/services/merchant.service";
import { publicService } from "@/services/public.service";

const STEPS = [
  { id: "basics", label: "البيانات الأساسية", icon: Store },
  { id: "contact", label: "معلومات التواصل", icon: Phone },
  { id: "location", label: "الموقع والتصنيف", icon: MapPin },
  { id: "review", label: "مراجعة وإرسال", icon: CheckCircle },
];

export default function MerchantOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
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
    category_public_id: "",
    city_public_id: "",
    zone_public_id: "",
  });

  useEffect(() => {
    // Load categories and cities
    Promise.all([
      publicService.getCategories(),
      publicService.getCities()
    ]).then(([catsRes, citiesRes]) => {
      // Handle potentially paginated structures from API resources
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : catsRes.data.data || []);
      setCities(Array.isArray(citiesRes.data) ? citiesRes.data : citiesRes.data.data || []);
    }).catch(err => {
      console.error("Failed to load setup data:", err);
    });
  }, []);

  useEffect(() => {
    if (formData.city_public_id) {
      publicService.getZones(formData.city_public_id).then(res => {
        setZones(Array.isArray(res) ? res : (res as any)?.data || []);
      }).catch(() => setZones([]));
    } else {
      setZones([]);
    }
  }, [formData.city_public_id]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Remove empty optional fields to prevent validation errors on the backend if they expect null
      const payload = { ...formData };
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === "") {
          (payload as any)[key] = null;
        }
      });

      const res = await merchantService.createStore(payload);
      // Immediately redirect to the store dashboard
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
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0F3D2E] dark:text-[#EAF3EC]">
          إعداد المحل الأول
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          أهلاً بك في منصة بال فيرس للتجار. يرجى إدخال تفاصيل محلك لبدء رحلتك معنا.
        </p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#EAF3EC] dark:bg-[#1F2522] z-0"></div>
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-1 bg-[#1E7D4E] z-0 transition-all duration-300" 
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-[#F9FBF9] dark:bg-[#121212] px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                isActive ? "border-[#1E7D4E] bg-[#1E7D4E] text-white" :
                isCompleted ? "border-[#1E7D4E] bg-white text-[#1E7D4E]" :
                "border-gray-300 bg-white text-gray-400"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold hidden sm:block ${
                isActive || isCompleted ? "text-[#0F3D2E] dark:text-[#EAF3EC]" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 md:p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6">البيانات الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المحل (بالعربية) *</label>
                <input
                  type="text"
                  required
                  value={formData.name_ar}
                  onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المحل (بالإنجليزية)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.name_en}
                  onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف المحل (بالعربية) *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description_ar}
                  onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف المحل (بالإنجليزية)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={formData.description_en}
                  onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6">معلومات التواصل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  dir="ltr"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الواتساب</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموقع الإلكتروني</label>
                <input
                  type="url"
                  dir="ltr"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6">الموقع والتصنيف</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف *</label>
                <select
                  required
                  value={formData.category_public_id}
                  onChange={e => setFormData({ ...formData, category_public_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map(c => (
                    <option key={c.public_id} value={c.public_id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدينة *</label>
                <select
                  required
                  value={formData.city_public_id}
                  onChange={e => setFormData({ ...formData, city_public_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                >
                  <option value="">اختر المدينة</option>
                  {cities.map(c => (
                    <option key={c.public_id} value={c.public_id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنطقة *</label>
                <select
                  required
                  disabled={!formData.city_public_id}
                  value={formData.zone_public_id}
                  onChange={e => setFormData({ ...formData, zone_public_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                >
                  <option value="">اختر المنطقة</option>
                  {zones.map(z => (
                    <option key={z.public_id} value={z.public_id}>{z.name_ar}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان التفصيلي (بالعربية) *</label>
                <input
                  type="text"
                  required
                  value={formData.address_ar}
                  onChange={e => setFormData({ ...formData, address_ar: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E] focus:border-[#1E7D4E]"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-[#1E7D4E]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
              مراجعة البيانات وإرسالها
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              بمجرد الضغط على زر "إنشاء وإرسال للمراجعة"، سيتم حفظ بيانات محلك وإرسالها مباشرة لفريق الإدارة للموافقة عليها. ستتمكن من تعديل البيانات وإضافة الصور من خلال لوحة التحكم لاحقاً.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#EAF3EC] dark:border-[#1F2522]">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
            className="px-6 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            السابق
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-[#0F3D2E] text-white rounded-lg font-bold hover:bg-[#1E7D4E] transition-colors"
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  إنشاء وإرسال للمراجعة
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
