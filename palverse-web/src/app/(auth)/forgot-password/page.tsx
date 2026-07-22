"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#171717] rounded-3xl p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-[#1E7D4E] transition-colors mb-6">
            <ArrowRight size={16} className="ml-1" />
            العودة لتسجيل الدخول
          </Link>
          <div className="relative w-16 h-16 mx-auto mb-4 bg-[#EAF3EC] dark:bg-[#1F2522] rounded-full flex items-center justify-center">
            <Image src="/brand/logo/palverse-icon.png" alt="Icon" width={32} height={32} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">استعادة كلمة المرور</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-[#1E7D4E] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">تم الإرسال!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              إذا كان هذا البريد مسجلاً لدينا، فستصلك رسالة تحتوي على تعليمات استعادة كلمة المرور.
            </p>
            <Link href="/login" className="block w-full py-3.5 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white rounded-xl font-bold transition-colors">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1F2522] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none transition-all text-left"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3.5 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال الرابط"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
