"use client";

import { Bell, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MerchantNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/merchant" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#0F3D2E] dark:text-[#EAF3EC]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
            الإشعارات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            أحدث التنبيهات والإشعارات الخاصة بنشاطك التجاري.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2520] rounded-[2rem] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 shadow-sm overflow-hidden p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 dark:bg-[#1F2522] rounded-full flex items-center justify-center mb-6">
          <Bell className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">لا توجد إشعارات جديدة</h2>
        <p className="text-gray-500 max-w-sm">
          أنت على اطلاع دائم! سيتم عرض أي تحديثات بخصوص محلاتك وعروضك هنا.
        </p>
      </div>
    </div>
  );
}
