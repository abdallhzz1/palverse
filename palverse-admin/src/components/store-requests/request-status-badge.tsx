import { StoreRequestStatus } from "@/types/store-requests";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestStatusBadgeProps {
  status: StoreRequestStatus;
  className?: string;
  showIcon?: boolean;
}

export function RequestStatusBadge({ status, className, showIcon = true }: RequestStatusBadgeProps) {
  switch (status) {
    case "submitted":
      return (
        <Badge className={cn("bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800", className)}>
          {showIcon && <Clock className="w-3 h-3 ml-1" />}
          قيد الانتظار
        </Badge>
      );
    case "under_review":
      return (
        <Badge className={cn("bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800", className)}>
          {showIcon && <FileSearch className="w-3 h-3 ml-1" />}
          قيد المراجعة
        </Badge>
      );
    case "approved":
      return (
        <Badge className={cn("bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800", className)}>
          {showIcon && <CheckCircle className="w-3 h-3 ml-1" />}
          معتمد
        </Badge>
      );
    case "rejected":
      return (
        <Badge className={cn("bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800", className)}>
          {showIcon && <XCircle className="w-3 h-3 ml-1" />}
          مرفوض
        </Badge>
      );
    case "needs_changes":
      return (
        <Badge className={cn("bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800", className)}>
          {showIcon && <AlertCircle className="w-3 h-3 ml-1" />}
          مطلوب تعديلات
        </Badge>
      );
    default:
      return (
        <Badge className={className}>
          غير معروف
        </Badge>
      );
  }
}
