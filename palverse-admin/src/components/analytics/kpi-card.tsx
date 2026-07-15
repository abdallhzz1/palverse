"use client";

import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value?: number | string;
  icon: ReactNode;
  isLoading?: boolean;
  error?: boolean;
  className?: string;
  iconClassName?: string;
}

export function KpiCard({
  title,
  value,
  icon,
  isLoading = false,
  error = false,
  className,
  iconClassName,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-5 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
          {title}
        </h3>
        <div
          className={cn(
            "p-2 bg-emerald-50 dark:bg-emerald-900/20 text-[#1E7D4E] dark:text-[#7FA789] rounded-lg",
            iconClassName
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-700" />
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">خطأ في التحميل</span>
          </div>
        ) : (
          <div className="text-2xl font-bold text-foreground dark:text-white">
            {value !== undefined ? value.toLocaleString("ar-EG") : "—"}
          </div>
        )}
      </div>
    </div>
  );
}
