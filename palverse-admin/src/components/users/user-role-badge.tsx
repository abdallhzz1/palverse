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
          label: "تاجر",
          classes: "bg-[#1E7D4E]/10 text-[#1E7D4E] dark:bg-[#1E7D4E]/30 dark:text-[#EAF3EC]",
        };
      case "customer":
        return {
          label: "مستخدم",
          classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        };
      default:
        return {
          label: role || "غير معروف",
          classes: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
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
