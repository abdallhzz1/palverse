"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, User, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/lib/api/client";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

interface City {
  id: number;
  public_id: string;
  name_ar: string;
}

const inputClass =
  "block w-full rounded-xl border border-[#EAF3EC] bg-[#F9FBF9] py-3 pe-3 ps-10 text-[#0F3D2E] outline-none transition-all focus:border-[#1E7D4E] focus:ring-4 focus:ring-[#1E7D4E]/10";

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
      const payload = {
        ...formData,
        email: formData.email.trim() || null,
      };
      await apiClient.post('/merchant-join-requests', payload);
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
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F5F7F6] px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-[#EAF3EC] bg-white p-10 text-center shadow-[0_20px_60px_-24px_rgba(15,61,46,0.25)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF3EC] text-[#1E7D4E]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#0F3D2E]">تم إرسال طلبك بنجاح!</h2>
          <p className="leading-relaxed text-[#6C8478]">
            شكراً لاهتمامك بالانضمام إلى دليل فلسطين. سيقوم فريق المتابعة الخاص بنا بالتواصل معك قريباً لاستكمال إجراءات التفعيل وإنشاء حسابك.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-[#1E7D4E] px-8 py-3 font-bold text-white transition-colors hover:bg-[#0F3D2E]"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F7F6] py-10 md:py-16">
      <div className="public-container">
        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-28px_rgba(15,61,46,0.3)] lg:grid-cols-2 lg:items-stretch">
          {/* Mobile photo strip */}
          <div className="relative h-40 w-full lg:hidden">
            <Image src={BRAND_PHOTOS.auth} alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/75 via-[#0F3D2E]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-heading text-lg font-bold text-white">
                انضم إلى مجتمع التجار في بال فيرس
              </p>
            </div>
          </div>

          {/* Form side */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-14 md:py-14">
            <Link href="/" className="mb-8 inline-flex w-fit items-center gap-2 transition-transform hover:scale-105">
              <Image src="/brand/logo/palverse-icon.png" alt="Palverse" width={44} height={44} />
            </Link>

            <h1 className="font-heading text-2xl font-extrabold text-[#0F3D2E] md:text-3xl">
              طلب انضمام للمنصة
            </h1>
            <p className="mt-2 text-[#6C8478]">
              أدخل بيانات النشاط ورقم الهاتف. فريق المتابعة يتواصل معك ويحدّد الباقة المناسبة عند التفعيل.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Merchant Name */}
                <div className="col-span-1">
                  <label className="mb-2 block text-sm font-medium text-[#0F3D2E]">اسم التاجر</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pe-3">
                      <User className="h-5 w-5 text-[#7FA789]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.merchant_name}
                      onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                      className={inputClass}
                      placeholder="الاسم الكامل"
                    />
                  </div>
                </div>

                {/* Store Name */}
                <div className="col-span-1">
                  <label className="mb-2 block text-sm font-medium text-[#0F3D2E]">اسم المحل التجاري</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pe-3">
                      <Store className="h-5 w-5 text-[#7FA789]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.store_name}
                      onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                      className={inputClass}
                      placeholder="مثال: سوبرماركت السعادة"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="col-span-1">
                  <label className="mb-2 block text-sm font-medium text-[#0F3D2E]">رقم الهاتف</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pe-3">
                      <Phone className="h-5 w-5 text-[#7FA789]" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`${inputClass} dir-ltr text-right`}
                      placeholder="0590000000"
                    />
                  </div>
                </div>

                {/* Email (optional) */}
                <div className="col-span-1">
                  <label className="mb-2 block text-sm font-medium text-[#0F3D2E]">
                    البريد الإلكتروني <span className="font-normal text-[#7FA789]">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pe-3">
                      <Mail className="h-5 w-5 text-[#7FA789]" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`${inputClass} dir-ltr text-right`}
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="col-span-1 md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#0F3D2E]">المدينة</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pe-3">
                      <MapPin className="h-5 w-5 text-[#7FA789]" />
                    </div>
                    <select
                      required
                      value={formData.city_id}
                      onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                      className={inputClass}
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
                  <label className="mb-2 block text-sm font-medium text-[#0F3D2E]">طبيعة النشاط أو أية ملاحظات (اختياري)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="block w-full resize-none rounded-xl border border-[#EAF3EC] bg-[#F9FBF9] p-4 text-[#0F3D2E] outline-none transition-all focus:border-[#1E7D4E] focus:ring-4 focus:ring-[#1E7D4E]/10"
                    placeholder="ما هي المنتجات أو الخدمات التي يقدمها محلك؟"
                  ></textarea>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-xl bg-[#1E7D4E] px-4 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-[#0F3D2E] disabled:opacity-50"
                >
                  {isLoading ? "جاري إرسال الطلب..." : "إرسال طلب الانضمام"}
                </button>
              </div>

              <p className="text-center text-sm text-[#6C8478]">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="font-bold text-[#1E7D4E] hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          </div>

          {/* Image side (desktop) */}
          <div className="relative hidden lg:block">
            <Image src={BRAND_PHOTOS.auth} alt="" fill sizes="50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/85 via-[#0F3D2E]/20 to-[#0F3D2E]/10" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <p className="font-heading text-sm font-bold tracking-[0.2em] text-[#EAF3EC]/80">
                بال فيرس للتجار
              </p>
              <p className="mt-4 max-w-sm font-heading text-2xl font-bold leading-snug">
                انضم إلى مئات التجار الذين يوسعون أعمالهم عبر بال فيرس
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-[#EAF3EC]/90">
                <CheckCircle2 className="h-5 w-5" />
                تسجيل سريع ومجاني بالكامل
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
