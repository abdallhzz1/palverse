import { Badge } from "@/components/ui/badge";
import { AdminOffer } from "@/types/offers";
import { isAfter, isBefore, parseISO } from "date-fns";

export function getOfferTimeState(offer: AdminOffer): "scheduled" | "current" | "expired" | "no_expiry" {
  if (!offer.starts_at && !offer.ends_at) return "no_expiry";
  
  const now = new Date();
  const start = offer.starts_at ? parseISO(offer.starts_at) : null;
  const end = offer.ends_at ? parseISO(offer.ends_at) : null;

  if (end && isAfter(now, end)) return "expired";
  if (start && isBefore(now, start)) return "scheduled";
  
  return "current";
}

export function getOfferVisibilityLabel(offer: AdminOffer): { label: string; visible: boolean; reason?: string } {
  if (!offer.is_active) {
    return { label: "مخفي", visible: false, reason: "العرض غير نشط إدارياً" };
  }
  
  const timeState = getOfferTimeState(offer);
  if (timeState === "scheduled") {
    return { label: "مخفي", visible: false, reason: "لم يبدأ العرض بعد" };
  }
  if (timeState === "expired") {
    return { label: "مخفي", visible: false, reason: "انتهى العرض" };
  }

  // Check store visibility if store is loaded
  if (offer.store) {
    if (offer.store.status !== "approved") {
      return { label: "مخفي", visible: false, reason: "المحل غير معتمد" };
    }
    if (!offer.store.is_active) {
      return { label: "مخفي", visible: false, reason: "المحل غير نشط" };
    }
  }

  return { label: "ظاهر للعامة", visible: true };
}

export function OfferAdminStatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge className="bg-[#EAF3EC] text-[#1E7D4E] hover:bg-[#EAF3EC]/80 border-none">
        نشط
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 hover:bg-red-50/80 border-none">
      غير نشط
    </Badge>
  );
}

export function OfferTimeStateBadge({ offer }: { offer: AdminOffer }) {
  const state = getOfferTimeState(offer);
  
  switch (state) {
    case "current":
    case "no_expiry":
      return (
        <Badge className="bg-[#EAF3EC] text-[#1E7D4E] hover:bg-[#EAF3EC]/80 border-none">
          ساري الآن
        </Badge>
      );
    case "scheduled":
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50/80 border-none">
          مجدول
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100/80 border-none">
          منتهي
        </Badge>
      );
  }
}
