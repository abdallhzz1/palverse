"use client";

import { usePublicAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { isMerchantRole } from "@/lib/auth/roles";

export function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isInitializing } = usePublicAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitializing, isAuthenticated, router]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const isMerchant = isMerchantRole(user?.roles);

  if (!isMerchant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">
          غير مصرح لك بالوصول
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          هذه الصفحة مخصصة للتجار فقط. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني أو تسجيل حساب تاجر.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/register/merchant"
            className="px-6 py-2 bg-[#0F3D2E] text-white rounded-lg font-bold hover:bg-[#1E7D4E] transition-colors"
          >
            تسجيل كتاجر
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
