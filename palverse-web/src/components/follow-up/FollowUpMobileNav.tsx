"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X,
  LayoutDashboard, 
  Store, 
  RefreshCcw, 
  CreditCard,
  PhoneCall,
  Users,
  LogOut,
  Home,
  FileText,
  Megaphone,
} from "lucide-react";
import { usePublicAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export function FollowUpMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = usePublicAuth();

  const menuItems = [
    { href: "/follow-up", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/follow-up/store-requests", label: "طلبات المحلات", icon: Store },
    { href: "/follow-up/renewals", label: "التجديدات", icon: RefreshCcw },
    { href: "/follow-up/unpaid", label: "غير المسددين", icon: CreditCard },
    { href: "/follow-up/calls", label: "سجل المكالمات", icon: PhoneCall },
    { href: "/follow-up/representatives", label: "المندوبون", icon: Users },
    { href: "/follow-up/advertisements", label: "الإعلانات الممولة", icon: Megaphone },
    { href: "/follow-up/blog", label: "المدونة", icon: FileText },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/follow-up" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="relative w-8 h-8">
              <Image 
                src="/brand/logo/palverse-icon.png" 
                alt="Palverse"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg text-[#0F3D2E] dark:text-[#EAF3EC]">
              المتابعة
            </span>
          </Link>
        </div>

        <div className="w-8 h-8 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center text-[#1E7D4E] dark:text-[#EAF3EC] font-bold text-sm shrink-0">
          {user?.name?.charAt(0) || "م"}
        </div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div className={`
        md:hidden fixed inset-y-0 right-0 w-72 bg-white dark:bg-[#1A1A1A] shadow-xl z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <span className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">القائمة</span>
          <button
            onClick={closeMenu}
            className="p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-[#F9FBF9] dark:bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center text-[#1E7D4E] dark:text-[#EAF3EC] font-bold text-lg shrink-0">
              {user?.name?.charAt(0) || "م"}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] truncate">
                {user?.name}
              </h2>
              <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                قسم المتابعة
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${isActive 
                    ? 'bg-[#1E7D4E] text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E] hover:text-[#1E7D4E] dark:hover:text-[#EAF3EC]'
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>الواجهة العامة</span>
          </Link>
          <button
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </>
  );
}
