"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MerchantNewStorePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/merchant/onboarding");
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-[#4B6358]" dir="rtl">
      جاري التحويل...
    </div>
  );
}
