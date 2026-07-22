"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Store, CreditCard, Bell, LogOut, ArrowRight } from "lucide-react";
import Image from "next/image";
import { usePublicAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "نظرة عامة", href: "/merchant", icon: LayoutDashboard },
  { name: "بيانات المحل", href: "/merchant/stores", icon: Store },
  { name: "الإشعارات", href: "/merchant/notifications", icon: Bell },
];

export function MerchantMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = usePublicAuth();

  return (
    <>
      <div className="lg:hidden flex items-center justify-between bg-[#0F3D2E] text-white p-4 sticky top-0 z-40">
        <Link href="/merchant" className="flex items-center gap-2">
          <Image src="/brand/logo/palverse-icon.png" alt="Palverse" width={32} height={32} className="brightness-0 invert" />
          <span className="font-bold text-lg">لوحة التاجر</span>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-1 hover:bg-[#1E7D4E] rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-full bg-[#0F3D2E] h-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1F2522]">
              <span className="font-bold text-xl text-white">القائمة</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-white hover:bg-[#1E7D4E] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/merchant" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
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

            <div className="p-4 border-t border-[#1F2522] space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#7FA789] hover:bg-[#1E7D4E]/50 hover:text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                العودة للموقع
              </Link>
              <button
                onClick={() => { setIsOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#7FA789] hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
