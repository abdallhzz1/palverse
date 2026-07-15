import { SubscriptionPlan } from "@/types/subscription-plans";
import { cn } from "@/lib/utils";

export function formatPlanPrice(price: number | string, currency: string | null = "ILS"): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return price.toString();

  if (num === 0) return "مجاني";

  const formatter = new Intl.NumberFormat("ar-PS", {
    style: "currency",
    currency: currency || "ILS",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  return formatter.format(num);
}

export function formatPlanDuration(days: number): string {
  if (days === 30) return "شهر واحد";
  if (days === 90) return "3 أشهر";
  if (days === 180) return "6 أشهر";
  if (days === 365 || days === 366) return "سنة واحدة";
  return `${days} يومًا`;
}

export function PlanPrice({ plan, className }: { plan: SubscriptionPlan; className?: string }) {
  return (
    <span className={cn("font-semibold text-foreground dark:text-white font-sans", className)} dir="ltr">
      {formatPlanPrice(plan.price, plan.currency)}
    </span>
  );
}

export function PlanDuration({ days, className }: { days: number; className?: string }) {
  return (
    <span className={cn("text-slate-700 dark:text-slate-300", className)}>
      {formatPlanDuration(days)}
    </span>
  );
}
