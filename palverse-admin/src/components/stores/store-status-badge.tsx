import { StoreStatus } from "@/types/store";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface StoreStatusBadgeProps {
  status: StoreStatus;
  className?: string;
  showIcon?: boolean;
}

export function StoreStatusBadge({ status, className = "", showIcon = true }: StoreStatusBadgeProps) {
  const configs = {
    pending: {
      label: "قيد المراجعة",
      classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
      icon: Clock,
    },
    approved: {
      label: "معتمد",
      classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
      icon: CheckCircle2,
    },
    rejected: {
      label: "مرفوض",
      classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.classes} ${className}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
