import { Badge } from "@/components/ui/badge";
import { SubscriptionStatus } from "@/types/subscriptions";
import { differenceInDays, isPast, parseISO } from "date-fns";

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "active": return "نشط";
    case "pending": return "قيد الانتظار";
    case "expired": return "منتهي";
    case "cancelled": return "ملغي";
    default: return status;
  }
}

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-[#EAF3EC] text-[#1E7D4E] hover:bg-[#EAF3EC]/80 border-none px-2 py-0.5 font-medium">نشط</Badge>;
    case "pending":
      return <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50/80 border-none px-2 py-0.5 font-medium">قيد الانتظار</Badge>;
    case "expired":
      return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100/80 border-none px-2 py-0.5 font-medium">منتهي</Badge>;
    case "cancelled":
      return <Badge className="bg-red-50 text-red-600 hover:bg-red-50/80 border-none px-2 py-0.5 font-medium">ملغي</Badge>;
    default:
      return <Badge className="bg-white text-slate-800 border-slate-200">{status}</Badge>;
  }
}

export function getRemainingDays(endsAt: string | null): number | null {
  if (!endsAt) return null;
  const date = parseISO(endsAt);
  if (isPast(date)) return null; // already passed
  const days = differenceInDays(date, new Date());
  return Math.max(0, days);
}

export function RemainingDaysBadge({ endsAt, status }: { endsAt: string | null, status: SubscriptionStatus }) {
  if (status === "expired" || status === "cancelled") {
    return <span className="text-sm text-slate-500 font-medium">منتهي</span>;
  }

  const days = getRemainingDays(endsAt);
  if (days === null) {
    return <span className="text-sm text-slate-500 font-medium">-</span>;
  }

  if (days === 0) {
    return <span className="text-sm font-semibold text-amber-600">ينتهي اليوم</span>;
  }

  if (days <= 7) {
    return <span className="text-sm font-semibold text-amber-600">متبقي {days} أيام</span>;
  }

  return <span className="text-sm font-medium text-slate-600">متبقي {days} يوماً</span>;
}
