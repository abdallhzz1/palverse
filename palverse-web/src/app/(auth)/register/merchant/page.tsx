"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, User, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/lib/api/client";

interface City {
  id: number;
  public_id: string;
  name_ar: string;
}

export default function MerchantRegisterPage() {
  const [formData, setFormData] = useState({
    merchant_name: "",
    email: "",
    phone: "",
    store_name: "",
    city_id: "",
    notes: "",
  });

  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Fetch cities
    apiClient.get('/cities').then(res => {
      setCities(res.data || []);
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiClient.post('/merchant-join-requests', formData);
      setIsSuccess(true);
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setError(err.data.errors[firstErrorKey][0]);
      } else {
        setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#F9FBF9] dark:bg-[#121212]">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#171717] p-8 rounded-2xl shadow-xl relative z-10 border border-[#EAF3EC] dark:border-[#1F2522]">
          <div className="w-20 h-20 bg-[#EAF3EC] text-[#1E7D4E] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تم إرسال طلبك بنجاح!</h2>
          <p className="text-[#7FA789]">
            شكراً لاهتمامك بالانضمام إلى دليل فلسطين. سيقوم فريق المتابعة الخاص بنا بالتواصل معك قريباً لاستكمال إجراءات التفعيل وإنشاء حسابك.
          </p>
          <Link href="/" className="inline-block mt-4 bg-[#1E7D4E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0F3D2E] transition-colors">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#F9FBF9] dark:bg-[#121212]">
      {/* Background illustrations */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-5 pointer-events-none">
        <Image 
          src="/brand/patterns/islamic-geometric-pattern.png" 
          alt="" 
          fill 
          className="object-cover"
        />
      </div>

      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-[#171717] p-8 rounded-2xl shadow-xl relative z-10 border border-[#EAF3EC] dark:border-[#1F2522]">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image 
              src="/brand/logo/palverse-icon.png" 
              alt="Palverse" 
              width={64} 
              height={64} 
              className="mx-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-[#0F3D2E] dark:text-[#EAF3EC]">
            طلب انضمام للمنصة
          </h2>
          <p className="mt-2 text-sm text-[#7FA789]">
            أدخل تفاصيل محلك وسيقوم فريقنا بالتواصل معك لتفعيل حسابك
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant Name */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم التاجر</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.merchant_name}
                  onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                  placeholder="الاسم الكامل"
                />
              </div>
            </div>

            {/* Store Name */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المحل التجاري</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                  placeholder="مثال: سوبرماركت السعادة"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] dir-ltr text-right"
                  placeholder="0590000000"
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني *</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] dir-ltr text-right"
                  placeholder="example@mail.com"
                />
              </div>
            </div>

            {/* City */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المدينة</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  value={formData.city_id}
                  onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                >
                  <option value="" disabled>اختر مدينتك</option>
                  {cities.map(city => (
                    <option key={city.public_id} value={city.public_id}>{city.name_ar}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">طبيعة النشاط أو أية ملاحظات (اختياري)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="block w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] resize-none"
                placeholder="ما هي المنتجات أو الخدمات التي يقدمها محلك؟"
              ></textarea>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#1E7D4E] hover:bg-[#0F3D2E] focus:outline-none disabled:opacity-50 transition-colors"
            >
              {isLoading ? "جاري إرسال الطلب..." : "إرسال طلب الانضمام"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
