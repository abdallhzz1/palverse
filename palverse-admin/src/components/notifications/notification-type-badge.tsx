import { NotificationType } from "@/types/notifications";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Store, AlertTriangle, Info, UserPlus } from "lucide-react";

export function getNotificationTypeInfo(type: NotificationType) {
  switch (type) {
    case "store_approved":
      return {
        label: "تم قبول المحل",
        icon: CheckCircle2,
        className: "bg-green-50 text-green-700 hover:bg-green-100 border-none",
      };
    case "store_rejected":
      return {
        label: "تم رفض المحل",
        icon: XCircle,
        className: "bg-red-50 text-red-700 hover:bg-red-100 border-none",
      };
    case "store_activated":
      return {
        label: "تفعيل المحل",
        icon: Store,
        className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none",
      };
    case "store_deactivated":
      return {
        label: "إيقاف المحل",
        icon: Store,
        className: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-none",
      };
    case "subscription_assigned":
      return {
        label: "تعيين اشتراك",
        icon: CheckCircle2,
        className: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-none",
      };
    case "subscription_cancelled":
      return {
        label: "إلغاء اشتراك",
        icon: XCircle,
        className: "bg-red-50 text-red-700 hover:bg-red-100 border-none",
      };
    case "subscription_expiring_soon":
      return {
        label: "اقتراب انتهاء الاشتراك",
        icon: AlertTriangle,
        className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none",
      };
    case "subscription_expired":
      return {
        label: "انتهاء الاشتراك",
        icon: XCircle,
        className: "bg-red-50 text-red-700 hover:bg-red-100 border-none",
      };
    case "new_join_request":
      return {
        label: "طلب انضمام جديد",
        icon: UserPlus,
        className: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none",
      };
    case "new_store_registration_request":
      return {
        label: "طلب تسجيل من مندوب",
        icon: Store,
        className: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-none",
      };
    default:
      return {
        label: "إشعار نظام",
        icon: Info,
        className: "bg-muted text-slate-700 hover:bg-muted border-border",
      };
  }
}

export function NotificationTypeBadge({ type }: { type: NotificationType }) {
  const info = getNotificationTypeInfo(type);
  const Icon = info.icon;
  
  return (
    <Badge className={`px-2.5 py-1 font-medium flex items-center w-fit gap-1.5 ${info.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {info.label}
    </Badge>
  );
}
