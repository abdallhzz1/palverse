"use client";

import { useState, Suspense, useEffect } from "react";
import { usePublicAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { getPostLoginPath } from "@/lib/auth/role-redirect";

function LoginForm() {
  const { login, isAuthenticated, user } = usePublicAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect away
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
      const loggedInUser = await login({ email, password, device_name: "palverse-web" });
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
        <div className="p-4 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm border border-red-100 dark:border-red-900/30 font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-1.5 h-full min-h-8 bg-red-500 rounded-full shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-[#0F3D2E] dark:text-[#EAF3EC] ms-1">
          البريد الإلكتروني
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-400 group-focus-within:text-[#1E7D4E] transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full ps-11 pe-4 py-3.5 bg-[#F9FBF9] dark:bg-[#111714] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 rounded-2xl focus:ring-4 focus:ring-[#1E7D4E]/10 focus:border-[#1E7D4E] outline-none transition-all text-left text-[#0F3D2E] dark:text-[#EAF3EC] font-medium"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ms-1">
          <label className="text-sm font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
            كلمة المرور
          </label>
          <Link href="/forgot-password" className="text-xs text-[#7FA789] hover:text-[#1E7D4E] dark:hover:text-[#4ade80] transition-colors font-bold">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-400 group-focus-within:text-[#1E7D4E] transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full ps-11 pe-12 py-3.5 bg-[#F9FBF9] dark:bg-[#111714] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 rounded-2xl focus:ring-4 focus:ring-[#1E7D4E]/10 focus:border-[#1E7D4E] outline-none transition-all text-left text-[#0F3D2E] dark:text-[#EAF3EC] font-medium tracking-widest placeholder:tracking-normal"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 hover:text-[#1E7D4E] transition-colors"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="group relative w-full py-4 bg-gradient-to-r from-[#1E7D4E] to-[#15603A] hover:from-[#15603A] hover:to-[#0F3D2E] text-white rounded-2xl font-bold text-lg transition-all shadow-[0_8px_20px_rgba(30,125,78,0.3)] hover:shadow-[0_12px_25px_rgba(30,125,78,0.4)] hover:-translate-y-1 overflow-hidden flex items-center justify-center gap-2"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        <span className="relative flex items-center gap-2">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "تسجيل الدخول"}
        </span>
      </button>

      {/* Join us link instead of generic sign up */}
      <p className="text-center text-sm text-[#7FA789] pt-4">
        ليس لديك حساب تاجر؟{" "}
        <Link href="/join-us" className="text-[#1E7D4E] dark:text-[#4ade80] font-bold hover:underline inline-flex items-center gap-1">
          أضف نشاطك مجاناً
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F6] dark:bg-[#121212] relative overflow-hidden py-12 px-4">
      
      {/* Subtle Pattern Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: "url('/brand/patterns/islamic-geometric-pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "300px"
        }}
      />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E7D4E]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1E7D4E]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-[480px] bg-white dark:bg-[#1F2522] rounded-[2.5rem] shadow-xl dark:shadow-2xl border border-white/50 dark:border-[#0F3D2E]/40 p-8 sm:p-12 relative z-10">
        
        {/* Back to home & Logo */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <div className="relative w-32 h-10">
              <Image src="/brand/logo/palverse-logo.png" alt="Palverse" fill className="object-contain" priority sizes="128px" />
            </div>
          </Link>
          
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] mb-5 shadow-sm border border-[#1E7D4E]/10">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">
            دخول شركاء النجاح
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            مرحباً بعودتك! سجل دخولك لإدارة نشاطك التجاري وعروضك.
          </p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" /></div>}>
          <LoginForm />
        </Suspense>

        {/* Back to Site Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#0F3D2E]/30 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-[#7FA789] hover:text-[#1E7D4E] transition-colors"
          >
            العودة للمنصة
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
