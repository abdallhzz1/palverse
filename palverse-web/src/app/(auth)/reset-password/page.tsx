"use client";

import { useState, Suspense } from "react";
import { authService } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

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
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-[#1E7D4E]" />
        <h2 className="mb-2 font-heading text-xl font-bold text-[#0F3D2E]">تم بنجاح!</h2>
        <p className="mb-8 text-[#6C8478]">
          تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.
        </p>
        <Link href="/login" className="block w-full rounded-xl bg-[#1E7D4E] py-3.5 font-bold text-white transition-colors hover:bg-[#0F3D2E]">
          الانتقال لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
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

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[#0F3D2E]">
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
            className="w-full rounded-xl border border-[#EAF3EC] bg-[#F9FBF9] px-4 py-3 pr-12 text-left outline-none transition-all focus:border-[#1E7D4E] focus:ring-4 focus:ring-[#1E7D4E]/10"
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
        <label className="text-sm font-bold text-[#0F3D2E]">
          تأكيد كلمة المرور الجديدة
        </label>
        <input
          type="password"
          required
          dir="ltr"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="w-full rounded-xl border border-[#EAF3EC] bg-[#F9FBF9] px-4 py-3 text-left outline-none transition-all focus:border-[#1E7D4E] focus:ring-4 focus:ring-[#1E7D4E]/10"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E7D4E] py-3.5 font-bold text-white transition-colors hover:bg-[#0F3D2E] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إعادة تعيين كلمة المرور"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell caption="خطوة أخيرة صغيرة، واحسابك جاهز للعمل من جديد.">
      <div className="rounded-[2rem] border border-white/60 bg-white p-8 shadow-[0_24px_70px_-28px_rgba(15,61,46,0.3)] sm:p-10">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1E7D4E]/10 bg-[#EAF3EC]">
            <Image src="/brand/logo/palverse-icon.png" alt="Icon" width={32} height={32} className="object-contain" />
          </div>
          <h1 className="mb-2 font-heading text-2xl font-bold text-[#0F3D2E]">إعادة تعيين كلمة المرور</h1>
          <p className="text-sm text-[#6C8478]">
            أدخل كلمة المرور الجديدة لحسابك.
          </p>
        </div>

        <Suspense fallback={<div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1E7D4E]" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </AuthPageShell>
  );
}
