"use client";

import Link from "next/link";
import { Store, UserPlus, Handshake } from "lucide-react";

export default function MerchantOnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3EC] text-[#1E7D4E]">
        <Store className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-[#0F3D2E]">تسجيل المحل غير متاح من لوحة التاجر</h1>
      <p className="mt-3 text-[#4B6358]">
        إنشاء الحسابات والمحلات يتم فقط عبر مندوب Palverse أو من خلال طلب الانضمام العام.
        بعد اعتماد الطلب يصلك حساب التاجر لإدارة المحل.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/join-us"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1E7D4E] px-4 py-3 text-white hover:bg-[#196B42]"
        >
          <UserPlus className="h-4 w-4" />
          طلب انضمام
        </Link>
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#C7D9CC] bg-white px-4 py-3 text-[#0F3D2E]">
          <Handshake className="h-4 w-4" />
          عبر المندوب الميداني
        </div>
      </div>

      <Link href="/merchant" className="mt-8 inline-block text-sm text-[#1E7D4E] underline">
        العودة للوحة التاجر
      </Link>
    </div>
  );
}
