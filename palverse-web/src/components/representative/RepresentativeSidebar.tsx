"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Store, CreditCard, Banknote, FileX, LogOut, ArrowRight, UserCircle } from "lucide-react";
import Image from "next/image";
import { usePublicAuth } from "@/contexts/AuthContext";
import { resolveStorageUrl } from "@/lib/media/resolve-storage-url";

const navItems = [
  { name: "نظرة عامة", href: "/representative", icon: LayoutDashboard },
  { name: "مناطقي", href: "/representative/zones", icon: MapPin },
  { name: "طلبات المتاجر", href: "/representative/store-requests", icon: Store },
  { name: "تقارير الرفض", href: "/representative/rejection-reports", icon: FileX },
  { name: "العمولات", href: "/representative/commissions", icon: Banknote },
  { name: "سندات القبض", href: "/representative/receipts", icon: CreditCard },
  { name: "الملف الشخصي", href: "/representative/profile", icon: UserCircle },
];

export function RepresentativeSidebar() {
  const pathname = usePathname();
  const { user, logout } = usePublicAuth();
  const avatarSrc = resolveStorageUrl(user?.avatar_url);

  return (
    <div className="hidden lg:flex flex-col w-64 bg-[#0F3D2E] min-h-screen text-[#EAF3EC] sticky top-0">
      <div className="p-6 border-b border-[#1F2522]">
        <Link href="/representative" className="flex items-center gap-3 mb-6">
          <Image src="/brand/logo/palverse-icon.png" alt="Palverse" width={40} height={40} className="brightness-0 invert" />
          <span className="font-bold text-xl">Palverse</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1E7D4E] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || "م"
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-white truncate">
              {user?.name}
            </h2>
            <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-[#1A3326] text-[#7FA789]">
              مندوب مبيعات
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/representative" && pathname.startsWith(item.href));
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
