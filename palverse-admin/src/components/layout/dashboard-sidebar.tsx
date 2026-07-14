"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Store,
  Tags,
  MapPin,
  Percent,
  CreditCard,
  Settings,
  FileText,
  HelpCircle,
  Activity,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "الرئيسية" },
  { href: "/users", icon: Users, label: "المستخدمون والتجار" },
  { href: "/stores", icon: Store, label: "المحلات" },
  { href: "/categories", icon: Tags, label: "التصنيفات" },
  { href: "/locations", icon: MapPin, label: "المدن والمناطق" },
  { href: "/offers", icon: Percent, label: "العروض" },
  { href: "/plans", icon: CreditCard, label: "خطط الاشتراك" },
  { href: "/settings", icon: Settings, label: "الإعدادات" },
  { href: "/pages", icon: FileText, label: "الصفحات" },
  { href: "/faq", icon: HelpCircle, label: "الأسئلة الشائعة" },
  { href: "/logs", icon: Activity, label: "سجل العمليات" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed right-0 top-0 z-40 hidden h-screen w-64 flex-col border-l border-sidebar-border bg-sidebar-background text-sidebar-foreground lg:flex transition-all duration-300">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* Fallback to text if image not found to prevent errors, but try to load image */}
          <div className="relative h-8 w-8">
            <Image
              src="/brand/palverse-icon.png"
              alt="Palverse Icon"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-xl font-bold tracking-tight">Palverse Admin</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-active text-white"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-active hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-active hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
        <div className="mt-4 text-center text-xs text-sidebar-foreground/50 text-latin">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
