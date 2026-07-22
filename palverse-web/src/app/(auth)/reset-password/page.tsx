"use client";

import { useState, Suspense } from "react";
import { authService } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailQuery);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== passwordConfirmation) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (!token) {
      setError("رمز الاستعادة مفقود من الرابط.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع. الرابط قد يكون منتهياً أو غير صالح.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-16 h-16 text-[#1E7D4E] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">تم بنجاح!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.
        </p>
        <Link href="/login" className="block w-full py-3.5 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white rounded-xl font-bold transition-colors">
          الانتقال لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
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

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            dir="ltr"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1F2522] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none transition-all text-left pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
          تأكيد كلمة المرور الجديدة
        </label>
        <input
          type="password"
          required
          dir="ltr"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1F2522] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#1E7D4E] focus:border-transparent outline-none transition-all text-left"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="w-full py-3.5 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إعادة تعيين كلمة المرور"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#171717] rounded-3xl p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm">
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4 bg-[#EAF3EC] dark:bg-[#1F2522] rounded-full flex items-center justify-center">
            <Image src="/brand/logo/palverse-icon.png" alt="Icon" width={32} height={32} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">إعادة تعيين كلمة المرور</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            أدخل كلمة المرور الجديدة لحسابك.
          </p>
        </div>

        <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
