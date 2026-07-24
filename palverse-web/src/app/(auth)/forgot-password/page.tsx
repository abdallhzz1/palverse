"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      // Backend might return generic error or specific. Keep it secure.
      setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell caption="لا تقلق، سنساعدك على استعادة الوصول إلى حسابك خلال دقائق.">
      <div className="rounded-[2rem] border border-white/60 bg-white p-8 shadow-[0_24px_70px_-28px_rgba(15,61,46,0.3)] sm:p-10">
        <div className="mb-8 text-center">
          <Link href="/login" className="mb-6 inline-flex items-center text-sm text-[#7FA789] transition-colors hover:text-[#1E7D4E]">
            <ArrowRight size={16} className="ml-1" />
            العودة لتسجيل الدخول
          </Link>
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1E7D4E]/10 bg-[#EAF3EC]">
            <Image src="/brand/logo/palverse-icon.png" alt="Icon" width={32} height={32} className="object-contain" />
          </div>
          <h1 className="mb-2 font-heading text-2xl font-bold text-[#0F3D2E]">استعادة كلمة المرور</h1>
          <p className="text-sm text-[#6C8478]">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-[#1E7D4E]" />
            <h2 className="mb-2 font-heading text-xl font-bold text-[#0F3D2E]">تم الإرسال!</h2>
            <p className="mb-8 text-[#6C8478]">
              إذا كان هذا البريد مسجلاً لدينا، فستصلك رسالة تحتوي على تعليمات استعادة كلمة المرور.
            </p>
            <Link href="/login" className="block w-full rounded-xl bg-[#1E7D4E] py-3.5 font-bold text-white transition-colors hover:bg-[#0F3D2E]">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#0F3D2E]">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#EAF3EC] bg-[#F9FBF9] px-4 py-3 text-left outline-none transition-all focus:border-[#1E7D4E] focus:ring-4 focus:ring-[#1E7D4E]/10"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E7D4E] py-3.5 font-bold text-white transition-colors hover:bg-[#0F3D2E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال الرابط"}
            </button>
          </form>
        )}
      </div>
    </AuthPageShell>
  );
}
