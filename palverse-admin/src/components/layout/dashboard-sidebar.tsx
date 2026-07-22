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
  HelpCircle,
  Activity,
  CheckSquare,
  PieChart,
  ClipboardList,
  Star,
  ShieldCheck,
  Banknote,
  FileX,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/reports", icon: PieChart, label: "التقارير" },
  { href: "/users", icon: Users, label: "المستخدمون" },
  { href: "/representatives", icon: ShieldCheck, label: "إدارة المناديب" },
  { href: "/commissions", icon: CreditCard, label: "العمولات" },
  { href: "/join-requests", icon: Users, label: "طلبات الانضمام المباشرة" },
  { href: "/store-requests", icon: ClipboardList, label: "طلبات تسجيل المحلات" },
  { href: "/stores", icon: Store, label: "المحلات" },
  { href: "/receipts", icon: Banknote, label: "سندات القبض" },
  { href: "/rejection-reports", icon: FileX, label: "تقارير الرفض" },
  { href: "/categories", icon: Tags, label: "التصنيفات" },
  { href: "/locations", icon: MapPin, label: "المدن والمناطق" },
  { href: "/offers", icon: Percent, label: "العروض" },
  { href: "/subscription-plans", icon: CreditCard, label: "خطط الاشتراك" },
  { href: "/subscriptions", icon: CheckSquare, label: "اشتراكات المحلات" },
  { href: "/reviews", icon: Star, label: "التقييمات" },
  { href: "/faqs", icon: HelpCircle, label: "الأسئلة الشائعة" },
  { href: "/audit-logs", icon: Activity, label: "سجل العمليات" },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3">
      <div className="flex flex-1 flex-col justify-evenly">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-active hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="leading-snug">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <p className="shrink-0 pt-3 text-center text-xs text-sidebar-foreground/50 text-latin">
        v{process.env.NEXT_PUBLIC_ADMIN_VERSION || "1.0.0"}
      </p>
    </nav>
  );
}

export function DashboardSidebar({ isOpen, onOpenChange }: DashboardSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  }, [pathname, onOpenChange]);

  const SidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
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

      <SidebarNav />
    </>
  );

  return (
    <>
      <aside className="fixed right-0 top-0 z-40 hidden h-screen w-64 flex-col overflow-hidden border-l border-sidebar-border bg-sidebar-background text-sidebar-foreground lg:flex">
        {SidebarContent}
      </aside>

      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-64 overflow-hidden border-sidebar-border bg-sidebar-background p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
          <div className="flex h-full flex-col overflow-hidden">{SidebarContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
