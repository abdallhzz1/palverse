"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Tag, CreditCard, Bell, LogOut, ArrowRight } from "lucide-react";
import Image from "next/image";
import { usePublicAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "نظرة عامة", href: "/merchant", icon: LayoutDashboard },
  { name: "بيانات المحل", href: "/merchant/stores", icon: Store },
  { name: "الإشعارات", href: "/merchant/notifications", icon: Bell },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  const { logout } = usePublicAuth();

  return (
    <div className="hidden lg:flex flex-col w-64 bg-[#0F3D2E] min-h-screen text-[#EAF3EC] sticky top-0">
      <div className="p-6">
        <Link href="/merchant" className="flex items-center gap-3">
          <Image src="/brand/logo/palverse-icon.png" alt="Palverse" width={40} height={40} className="brightness-0 invert" />
          <span className="font-bold text-xl">لوحة المحل</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/merchant" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                isActive
                  ? "bg-[#1E7D4E] text-white"
                  : "text-[#7FA789] hover:bg-[#1E7D4E]/50 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-[#1F2522]">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7FA789] hover:bg-[#1E7D4E]/50 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للموقع
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#7FA789] hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
