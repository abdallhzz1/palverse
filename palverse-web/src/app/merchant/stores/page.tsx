"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { merchantService } from "@/services/merchant.service";

export default function MerchantStoresList() {
  const router = useRouter();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await merchantService.getStores();
        if (res.data && res.data.length > 0) {
          router.replace(`/merchant/stores/${res.data[0].public_id}`);
        } else {
          router.replace("/merchant/onboarding");
        }
      } catch (err) {
        console.error("Failed to fetch stores", err);
        router.replace("/merchant/onboarding");
      }
    };
    fetchStores();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
