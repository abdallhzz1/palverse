import { Badge } from "@/components/ui/badge";

interface AuditActionBadgeProps {
  action: string;
}

const getActionDetails = (action: string): { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" } => {
  const normalizedAction = action.toLowerCase();
  
  if (normalizedAction.includes("created") || normalizedAction.includes("registered")) {
    return { label: "تم الإنشاء", variant: "success" };
  }
  
  if (normalizedAction.includes("updated") || normalizedAction.includes("reordered")) {
    return { label: "تم التعديل", variant: "default" };
  }
  
  if (normalizedAction.includes("deleted") || normalizedAction.includes("revoked") || normalizedAction.includes("cancelled")) {
    return { label: "تم الحذف", variant: "destructive" };
  }
  
  if (normalizedAction.includes("approved") || normalizedAction.includes("verified") || normalizedAction.includes("activated")) {
    return { label: "تم الاعتماد/التفعيل", variant: "success" };
  }
  
  if (normalizedAction.includes("rejected") || normalizedAction.includes("suspended") || normalizedAction.includes("deactivated")) {
    return { label: "تم الرفض/الإيقاف", variant: "danger" as "destructive" }; // Maps to danger class if it exists or destructive
  }
  
  if (normalizedAction.includes("submitted") || normalizedAction.includes("sent")) {
    return { label: "مُرسل", variant: "secondary" };
  }
  
  if (normalizedAction.includes("uploaded")) {
    return { label: "تم الرفع", variant: "default" };
  }

  // Fallback map
  return { label: action, variant: "outline" };
};

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const { label, variant } = getActionDetails(action);
  
  // Custom class for danger mapping since badge might only support destructive natively
  const isDanger = action.includes("rejected") || action.includes("suspended") || action.includes("deactivated");
  
  return (
    <Badge 
      variant={variant === "success" ? "default" : variant} 
      className={
        variant === "success" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200" : 
        isDanger ? "bg-red-100 text-red-800 hover:bg-red-100 border border-red-200" : ""
      }
    >
      {label}
    </Badge>
  );
}
