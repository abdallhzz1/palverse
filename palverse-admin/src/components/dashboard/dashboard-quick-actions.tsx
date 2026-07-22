"use client";

import Link from "next/link";
import {
  Store,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/stores",
    label: "المحلات",
    description: "إدارة ومراجعة المحلات",
    icon: Store,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/store-requests",
    label: "طلبات التسجيل",
    description: "متابعة الطلبات الجديدة",
    icon: ClipboardList,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    href: "/representatives",
    label: "المناديب",
    description: "إدارة فريق المبيعات",
    icon: ShieldCheck,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    href: "/commissions",
    label: "العمولات",
    description: "مراجعة وصرف العمولات",
    icon: CreditCard,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/notifications",
    label: "الإشعارات",
    description: "متابعة التنبيهات",
    icon: Bell,
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
];

export function DashboardQuickActions() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">إجراءات سريعة</h2>
          <p className="text-sm text-muted-foreground">الوصول المباشر لأهم الأقسام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-[#1E7D4E]/30 hover:shadow-md"
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", action.accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="truncate text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:-translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
