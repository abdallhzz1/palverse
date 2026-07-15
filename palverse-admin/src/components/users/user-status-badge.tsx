import { UserStatus } from "@/types/user";

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function UserStatusBadge({ status, className = "" }: UserStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "نشط",
          classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        };
      case "inactive":
        return {
          label: "غير نشط",
          classes: "bg-muted text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-border dark:border-slate-700",
        };
      case "suspended":
        return {
          label: "موقوف",
          classes: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900",
        };
      default:
        return {
          label: status || "غير معروف",
          classes: "bg-muted text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-border dark:border-gray-700",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}
