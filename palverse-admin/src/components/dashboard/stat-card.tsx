import { ReactNode } from "react";
import { formatCompactNumber } from "@/lib/utils/formatters";

interface StatCardProps {
  title: string;
  value: number | undefined | null;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  isLoading?: boolean;
}

export function StatCard({ title, value, icon, trend, trendLabel, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      </div>
    );
  }

  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</h3>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-[#1E7D4E]">
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {formatCompactNumber(value)}
        </span>
        {trend !== undefined && (
          <span 
            className={`text-xs font-medium flex items-center gap-0.5 ${
              isPositive ? "text-emerald-600" : isNegative ? "text-amber-500" : "text-slate-400"
            }`}
            dir="ltr"
          >
            {isPositive ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      
      {trendLabel && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          {trendLabel}
        </p>
      )}
    </div>
  );
}
