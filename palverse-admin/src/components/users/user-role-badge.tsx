import { UserRole } from "@/types/user";

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function UserRoleBadge({ role, className = "" }: UserRoleBadgeProps) {
  const getRoleConfig = () => {
    switch (role) {
      case "admin":
        return {
          label: "مدير",
          classes: "bg-[#0F3D2E]/10 text-[#0F3D2E] dark:bg-[#0F3D2E]/30 dark:text-[#7FA789]",
        };
      case "merchant":
        return {
          label: "صاحب محل",
          classes: "bg-[#1E7D4E]/10 text-[#1E7D4E] dark:bg-[#1E7D4E]/30 dark:text-[#EAF3EC]",
        };
      case "customer":
        return {
          label: "مستخدم (دور قديم)",
          classes: "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-muted-foreground line-through decoration-gray-400",
        };
      case "representative":
        return {
          label: "مندوب مبيعات",
          classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        };
      case "follow_up":
        return {
          label: "متابعة",
          classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        };

      default:
        return {
          label: role || "غير معروف",
          classes: "bg-muted text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const config = getRoleConfig();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}
