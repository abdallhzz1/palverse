"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type StatVariant = "default" | "featured" | "warning" | "danger" | "success";

interface DashboardStatCardProps {
  title: string;
  value?: number | string;
  icon: ReactNode;
  isLoading?: boolean;
  error?: boolean;
  description?: string;
  periodValue?: number;
  periodLabel?: string;
  variant?: StatVariant;
  href?: string;
  className?: string;
  iconClassName?: string;
}

const variantStyles: Record<StatVariant, { card: string; icon: string }> = {
  default: {
    card: "border-border hover:border-[#1E7D4E]/20",
    icon: "bg-emerald-50 text-[#1E7D4E] dark:bg-emerald-900/20 dark:text-[#7FA789]",
  },
  featured: {
    card: "border-[#1E7D4E]/20 bg-gradient-to-bl from-card to-[#EAF3EC]/40 dark:from-[#1F2522] dark:to-[#0F3D2E]/30",
    icon: "bg-[#0F3D2E] text-white dark:bg-[#1E7D4E] dark:text-white",
  },
  warning: {
    card: "border-amber-200/60 hover:border-amber-300/60 dark:border-amber-900/30",
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  danger: {
    card: "border-red-200/60 hover:border-red-300/60 dark:border-red-900/30",
    icon: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
  success: {
    card: "border-emerald-200/60 hover:border-emerald-300/60 dark:border-emerald-900/30",
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
};

export function DashboardStatCard({
  title,
  value,
  icon,
  isLoading = false,
  error = false,
  description,
  periodValue,
  periodLabel = "خلال الفترة",
  variant = "default",
  href,
  className,
  iconClassName,
}: DashboardStatCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        styles.card,
        href && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : error ? (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">خطأ في التحميل</span>
              </div>
            ) : (
              <p
                className={cn(
                  "font-bold tracking-tight text-foreground",
                  variant === "featured" ? "text-3xl" : "text-2xl"
                )}
              >
                {value !== undefined ? value.toLocaleString("ar-EG") : "—"}
              </p>
            )}
          </div>

          {description && !isLoading && !error && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}

          {periodValue !== undefined && !isLoading && !error && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>
                +{periodValue.toLocaleString("ar-EG")} {periodLabel}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            styles.icon,
            iconClassName
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
