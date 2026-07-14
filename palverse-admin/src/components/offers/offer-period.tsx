import { AdminOffer } from "@/types/offers";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function OfferPeriod({ offer, className }: { offer: AdminOffer; className?: string }) {
  if (!offer.starts_at && !offer.ends_at) {
    return <span className={cn("text-sm text-slate-600", className)}>مستمر دون تاريخ انتهاء</span>;
  }

  const startStr = offer.starts_at ? format(parseISO(offer.starts_at), "d MMMM yyyy", { locale: ar }) : null;
  const endStr = offer.ends_at ? format(parseISO(offer.ends_at), "d MMMM yyyy", { locale: ar }) : null;

  return (
    <div className={cn("text-sm text-slate-600 flex flex-col gap-0.5", className)}>
      {startStr && endStr ? (
        <span>من {startStr} إلى {endStr}</span>
      ) : startStr ? (
        <span>يبدأ في {startStr}</span>
      ) : endStr ? (
        <span>ينتهي في {endStr}</span>
      ) : null}
    </div>
  );
}
