"use client";

import { useState, Suspense, useEffect } from "react";
import { usePublicAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Phone, Lock, ArrowRight } from "lucide-react";
import { getPostLoginPath } from "@/lib/auth/role-redirect";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

function LoginForm() {
  const { login, isAuthenticated, user } = usePublicAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("redirect");

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const path = getPostLoginPath(user, returnUrl);
      router.replace(path);
    }
  }, [isAuthenticated, user, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loggedInUser = await login({
        login: loginId.trim(),
        password,
        device_name: "palverse-web",
      });
      const path = getPostLoginPath(loggedInUser, returnUrl);
      router.replace(path);
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول. يرجى التحقق من بياناتك.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-top-2 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
          <div className="h-full min-h-8 w-1.5 shrink-0 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="ms-1 text-sm font-bold text-[#0F3D2E]">
          رقم الهاتف أو البريد الإلكتروني
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400 transition-colors group-focus-within:text-[#1E7D4E]">
            <Phone className="h-5 w-5" />
          </div>
          <input
            type="text"
            required
            dir="ltr"
            autoComplete="username"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="w-full rounded-2xl border border-[#EAF3EC] bg-[#F9FBF9] py-3.5 ps-11 pe-4 text-left font-medium text-[#0F3D2E] outline-none transition-all focus:border-[#1E7D4E] focus:ring-4 focus:ring-[#1E7D4E]/10"
            placeholder="0590000000 أو name@example.com"
          />
        </div>
        <p className="ms-1 text-xs text-[#7FA789]">الاعتماد الأساسي على رقم الهاتف؛ البريد اختياري إن وُجد.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ms-1">
          <label className="text-sm font-bold text-[#0F3D2E]">
            كلمة المرور
          </label>
          <Link href="/forgot-password" className="text-xs font-bold text-[#7FA789] transition-colors hover:text-[#1E7D4E]">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400 transition-colors group-focus-within:text-[#1E7D4E]">
            <Lock className="h-5 w-5" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-[#EAF3EC] bg-[#F9FBF9] py-3.5 ps-11 pe-12 text-left font-medium tracking-widest text-[#0F3D2E] outline-none transition-all placeholder:tracking-normal focus:border-[#1E7D4E] focus:ring-4 focus:ring-[#1E7D4E]/10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 transition-colors hover:text-[#1E7D4E]"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E7D4E] to-[#15603A] py-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(30,125,78,0.3)] transition-all hover:-translate-y-1 hover:from-[#15603A] hover:to-[#0F3D2E] hover:shadow-[0_12px_25px_rgba(30,125,78,0.4)]"
      >
        <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-in-out group-hover:translate-y-0" />
        <span className="relative flex items-center gap-2">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "تسجيل الدخول"}
        </span>
      </button>

      <p className="pt-4 text-center text-sm text-[#6C8478]">
        ليس لديك حساب تاجر؟{" "}
        <Link href="/join-us" className="inline-flex items-center gap-1 font-bold text-[#1E7D4E] hover:underline">
          أضف نشاطك مجاناً
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthPageShell caption="مرحباً بعودتك! سجل دخولك لإدارة نشاطك التجاري وعروضك بكل سهولة.">
      <div className="rounded-[2rem] border border-white/60 bg-white p-8 shadow-[0_24px_70px_-28px_rgba(15,61,46,0.3)] sm:p-10">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <Link href="/" className="mb-6 inline-block transition-transform hover:scale-105">
            <div className="relative h-10 w-32">
              <Image src="/brand/logo/palverse-logo.png" alt="Palverse" fill className="object-contain" priority sizes="128px" />
            </div>
          </Link>

          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1E7D4E]/10 bg-[#EAF3EC] text-[#1E7D4E] shadow-sm">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mb-2 font-heading text-3xl font-bold text-[#0F3D2E]">
            دخول شركاء النجاح
          </h1>
          <p className="text-[#6C8478]">
            سجّل دخولك برقم الهاتف أو البريد الإلكتروني.
          </p>
        </div>

        <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1E7D4E]" /></div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-8 border-t border-[#EAF3EC] pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#7FA789] transition-colors hover:text-[#1E7D4E]"
          >
            العودة للمنصة
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
