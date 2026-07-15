import { AdminOffer } from "@/types/offers";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function formatCurrency(amount: string | number, currency: string = "ILS") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return amount.toString();
  
  // Format based on currency, typically ₪ for ILS
  const formatter = new Intl.NumberFormat("ar-PS", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  
  return formatter.format(num);
}

export function OfferPrice({ offer, className }: { offer: AdminOffer; className?: string }) {
  const currentPrice = formatCurrency(offer.price, offer.currency);
  
  const oldPriceNum = offer.old_price ? parseFloat(offer.old_price as string) : 0;
  const priceNum = parseFloat(offer.price as string);
  
  const hasValidOldPrice = oldPriceNum > priceNum;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-semibold text-foreground dark:text-white">
        {currentPrice}
      </span>
      {hasValidOldPrice && (
        <span className="text-sm text-muted-foreground line-through decoration-slate-400">
          {formatCurrency(offer.old_price!, offer.currency)}
        </span>
      )}
    </div>
  );
}
