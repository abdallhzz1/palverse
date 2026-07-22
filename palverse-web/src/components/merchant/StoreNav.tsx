"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Edit3, Image as ImageIcon, Clock, Link as LinkIcon, Tag, CreditCard, Star } from "lucide-react";

export function StoreNav({ storePublicId }: { storePublicId: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: "نظرة عامة", href: `/merchant/stores/${storePublicId}`, icon: LayoutDashboard },
    { name: "تحديث البيانات", href: `/merchant/stores/${storePublicId}/edit`, icon: Edit3 },
    { name: "الصور والشعار", href: `/merchant/stores/${storePublicId}/media`, icon: ImageIcon },
    { name: "ساعات العمل", href: `/merchant/stores/${storePublicId}/hours`, icon: Clock },
    { name: "روابط التواصل", href: `/merchant/stores/${storePublicId}/social-links`, icon: LinkIcon },
    { name: "العروض", href: `/merchant/stores/${storePublicId}/offers`, icon: Tag },
    { name: "الاشتراك", href: `/merchant/stores/${storePublicId}/subscription`, icon: CreditCard },
    { name: "التقييمات", href: `/merchant/stores/${storePublicId}/reviews`, icon: Star },
  ];

  return (
    <div className="bg-white dark:bg-[#171717] rounded-xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden mb-6">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== `/merchant/stores/${storePublicId}` && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-5 py-4 whitespace-nowrap font-bold text-sm transition-colors border-b-2 ${
                isActive
                  ? "border-[#1E7D4E] text-[#1E7D4E]"
                  : "border-transparent text-gray-500 hover:text-[#0F3D2E] dark:hover:text-[#EAF3EC] hover:bg-gray-50 dark:hover:bg-[#252525]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
