"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, LogOut, Menu, MapPin, Banknote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { usePublicAuth } from "@/contexts/AuthContext";

export function RepresentativeMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = usePublicAuth();

  const navItems = [
    { name: "نظرة عامة", href: "/representative", icon: LayoutDashboard },
    { name: "مناطقي", href: "/representative/zones", icon: MapPin },
    { name: "الطلبات", href: "/representative/store-requests", icon: Store },
    { name: "العمولات", href: "/representative/commissions", icon: Banknote },
  ];

  return (
    <>
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#121212] border-b border-[#EAF3EC] dark:border-[#1F2522] sticky top-0 z-40">
        <Link href="/representative" className="flex items-center gap-2">
          <Image src="/brand/logo/palverse-icon.png" alt="Palverse" width={32} height={32} />
          <span className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">لوحة المندوب</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[#0F3D2E] dark:text-[#EAF3EC] rounded-lg hover:bg-[#EAF3EC] dark:hover:bg-[#1F2522]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 bottom-0 right-0 w-64 bg-white dark:bg-[#121212] shadow-xl flex flex-col">
            <div className="p-6">
              <Link href="/representative" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <Image src="/brand/logo/palverse-icon.png" alt="Palverse" width={40} height={40} />
                <span className="font-bold text-xl text-[#0F3D2E] dark:text-[#EAF3EC]">لوحة المندوب</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/representative" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                      isActive
                        ? "bg-[#EAF3EC] dark:bg-[#1F2522] text-[#1E7D4E] dark:text-[#EAF3EC]"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#EAF3EC] dark:border-[#1F2522]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold"
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
