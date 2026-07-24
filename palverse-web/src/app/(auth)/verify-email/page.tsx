"use client";

import { useEffect, useState, Suspense } from "react";
import { authService } from "@/services/auth.service";
import { usePublicAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

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
        <Loader2 className="h-8 w-8 animate-spin text-[#1E7D4E]" />
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-[#1E7D4E]" />
        <h2 className="mb-2 font-heading text-2xl font-bold text-[#0F3D2E]">تم التحقق!</h2>
        <p className="mb-8 text-[#6C8478]">
          بريدك الإلكتروني موثق بالفعل.
        </p>
        <Link href="/account" className="block w-full rounded-xl bg-[#1E7D4E] py-3.5 font-bold text-white transition-colors hover:bg-[#0F3D2E]">
          الذهاب إلى لوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF3EC] text-[#1E7D4E]">
        <Mail className="h-10 w-10" />
      </div>
      
      <h1 className="mb-4 font-heading text-2xl font-bold text-[#0F3D2E]">
        تأكيد البريد الإلكتروني
      </h1>
      
      <p className="mb-8 text-[#6C8478]">
        للحفاظ على أمان حسابك والوصول للميزات الكاملة، يجب تأكيد بريدك الإلكتروني. لقد قمنا بإرسال رابط التوثيق مسبقاً.
      </p>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-right text-sm text-red-600">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-right text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>تم إرسال رابط التوثيق بنجاح! يرجى تفقد صندوق الوارد.</span>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E7D4E] py-3.5 font-bold text-white transition-colors hover:bg-[#0F3D2E] disabled:opacity-50"
        >
          {isResending ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال الرابط مجدداً"}
        </button>
        
        <Link href="/account" className="inline-flex items-center text-sm font-bold text-[#7FA789] hover:text-[#0F3D2E]">
          الاستمرار إلى الحساب مؤقتاً
          <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthPageShell caption="خطوة أخيرة لتأمين حسابك والاستفادة من كل الميزات.">
      <div className="rounded-[2rem] border border-white/60 bg-white p-8 shadow-[0_24px_70px_-28px_rgba(15,61,46,0.3)] sm:p-10">
        <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1E7D4E]" /></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </AuthPageShell>
  );
}
