"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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
  CheckSquare,
  Bell,
  PieChart
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/reports", icon: PieChart, label: "التقارير" },
  { href: "/users", icon: Users, label: "المستخدمون والتجار" },
  { href: "/stores", icon: Store, label: "المحلات" },
  { href: "/categories", icon: Tags, label: "التصنيفات" },
  { href: "/locations", icon: MapPin, label: "المدن والمناطق" },
  { href: "/offers", icon: Percent, label: "العروض" },
  { href: "/subscription-plans", icon: CreditCard, label: "خطط الاشتراك" },
  { href: "/subscriptions", icon: CheckSquare, label: "اشتراكات المحلات" },
  { href: "/notifications", icon: Bell, label: "الإشعارات" },
  { href: "/pages", icon: FileText, label: "الصفحات" },
  { href: "/faqs", icon: HelpCircle, label: "الأسئلة الشائعة" },
  { href: "/audit-logs", icon: Activity, label: "سجل العمليات" },
  { href: "/settings", icon: Settings, label: "الإعدادات" },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DashboardSidebar({ isOpen, onOpenChange }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  }, [pathname, onOpenChange]);

  const SidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* Apply brightness-0 invert so the logo renders white against the dark green background */}
          <div className="relative h-8 w-8 brightness-0 invert">
            <Image
              src="/brand/palverse-icon.png"
              alt="Palverse Icon"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Palverse Admin</span>
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

      <div className="border-t border-sidebar-border p-4 shrink-0">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-active hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
        <div className="mt-4 text-center text-xs text-sidebar-foreground/50 text-latin">
          Palverse Admin v{process.env.NEXT_PUBLIC_ADMIN_VERSION || "1.0.0"}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed right-0 top-0 z-40 hidden h-screen w-64 flex-col border-l border-sidebar-border bg-sidebar-background text-sidebar-foreground lg:flex transition-all duration-300">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-64 p-0 bg-sidebar-background text-sidebar-foreground border-sidebar-border">
          <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
          <div className="flex h-full flex-col">
            {SidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
