"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  RefreshCcw, 
  CreditCard,
  PhoneCall,
  Users,
  Bell,
  LogOut,
  Home,
  UserCircle,
  Banknote,
  FileX,
  Megaphone,
  FileText
} from "lucide-react";
import { usePublicAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { resolveStorageUrl } from "@/lib/media/resolve-storage-url";

export function FollowUpSidebar() {
  const pathname = usePathname();
  const { user, logout } = usePublicAuth();
  const avatarSrc = resolveStorageUrl(user?.avatar_url);

  const menuItems = [
    { href: "/follow-up", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/follow-up/store-requests", label: "طلبات المحلات", icon: Store },
    { href: "/follow-up/join-requests", label: "طلبات الانضمام", icon: Store },
    { href: "/follow-up/receipts", label: "سندات القبض", icon: Banknote },
    { href: "/follow-up/rejection-reports", label: "تقارير الرفض", icon: FileX },
    { href: "/follow-up/renewals", label: "التجديدات", icon: RefreshCcw },
    { href: "/follow-up/unpaid", label: "غير المسددين", icon: CreditCard },
    { href: "/follow-up/representatives", label: "المندوبون", icon: Users },
    { href: "/follow-up/advertisements", label: "الإعلانات الممولة", icon: Megaphone },
    { href: "/follow-up/blog", label: "المدونة", icon: FileText },
    { href: "/follow-up/profile", label: "الملف الشخصي", icon: UserCircle },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1A1A1A] border-l border-gray-200 dark:border-gray-800 h-screen sticky top-0 shrink-0">
      {/* Logo & Brand */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <Image 
              src="/brand/logo/palverse-icon.png" 
              alt="Palverse"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-xl text-[#0F3D2E] dark:text-[#EAF3EC]">
            Palverse
          </span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center text-[#1E7D4E] dark:text-[#EAF3EC] font-bold text-lg shrink-0 overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || "م"
            )}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>الواجهة العامة</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
