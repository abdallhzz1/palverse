"use client";

import { useEffect, useState, Suspense } from "react";
import { authService } from "@/services/auth.service";
import { usePublicAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const { isAuthenticated, isInitializing } = usePublicAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tokenUrl = searchParams.get("url") || ""; // We might get redirected here with a url if testing locally, but usually it's handled differently.
  
  const [status, setStatus] = useState<"loading" | "unverified" | "verified">("loading");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isInitializing) return;
    
    if (!isAuthenticated) {
      router.replace("/login?redirect=/verify-email");
      return;
    }

    const checkStatus = async () => {
      try {
        const state = await authService.getVerificationStatus();
        if (state.is_verified) {
          setStatus("verified");
        } else {
          setStatus("unverified");
        }
      } catch (err) {
        setError("تعذر جلب حالة التحقق. يرجى المحاولة لاحقاً.");
        setStatus("unverified");
      }
    };

    checkStatus();
  }, [isAuthenticated, isInitializing, router]);

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      await authService.resendVerificationEmail();
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || "فشل إرسال رابط التحقق.");
    } finally {
      setIsResending(false);
    }
  };

  if (isInitializing || status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" />
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-16 h-16 text-[#1E7D4E] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">تم التحقق!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          بريدك الإلكتروني موثق بالفعل.
        </p>
        <Link href="/account" className="block w-full py-3.5 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white rounded-xl font-bold transition-colors">
          الذهاب إلى لوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-6 bg-[#EAF3EC] dark:bg-[#1F2522] rounded-full flex items-center justify-center text-[#1E7D4E]">
        <Mail className="w-10 h-10" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4">
        تأكيد البريد الإلكتروني
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        للحفاظ على أمان حسابك والوصول للميزات الكاملة، يجب تأكيد بريدك الإلكتروني. لقد قمنا بإرسال رابط التوثيق مسبقاً.
      </p>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2 text-right">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 flex items-start gap-2 text-right">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>تم إرسال رابط التوثيق بنجاح! يرجى تفقد صندوق الوارد.</span>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-3.5 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isResending ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال الرابط مجدداً"}
        </button>
        
        <Link href="/account" className="inline-flex items-center text-sm text-gray-500 hover:text-[#0F3D2E] dark:hover:text-[#EAF3EC] font-bold">
          الاستمرار إلى الحساب مؤقتاً
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#171717] rounded-3xl p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" /></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
