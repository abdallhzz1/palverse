import { AdminStore, StoreSubscriptionSummary } from "@/types/store";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface StoreVisibilityBadgeProps {
  store: AdminStore;
  activeSubscription?: StoreSubscriptionSummary | null;
  className?: string;
  showReason?: boolean;
  showAssignAction?: boolean;
}

function resolveVisibility(
  store: AdminStore,
  activeSubscription?: StoreSubscriptionSummary | null
) {
  if (store.status !== "approved") {
    return {
      isVisible: false,
      reason: "المحل غير معتمد",
      needsSubscription: false,
      classes:
        "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-muted-foreground border border-border dark:border-slate-700",
    };
  }

  if (!store.is_active) {
    return {
      isVisible: false,
      reason: "المحل غير نشط",
      needsSubscription: false,
      classes:
        "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-muted-foreground border border-border dark:border-slate-700",
    };
  }

  const hasActiveFromApi = store.has_active_subscription === true;
  const hasActiveFromProp =
    !!activeSubscription &&
    activeSubscription.status === "active" &&
    activeSubscription.is_currently_valid;
  const hasActiveSubscription =
    store.has_active_subscription !== undefined
      ? hasActiveFromApi
      : hasActiveFromProp;

  const isPubliclyVisible =
    store.is_publicly_visible !== undefined
      ? store.is_publicly_visible
      : hasActiveSubscription;

  if (!hasActiveSubscription || !isPubliclyVisible) {
    return {
      isVisible: false,
      reason: !hasActiveSubscription
        ? "لا يوجد اشتراك نشط"
        : "المحل غير ظاهر للعامة",
      needsSubscription: !hasActiveSubscription,
      classes:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    };
  }

  return {
    isVisible: true,
    reason: "ظاهر للعامة",
    needsSubscription: false,
    classes:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  };
}

export function StoreVisibilityBadge({
  store,
  activeSubscription,
  className = "",
  showReason = true,
  showAssignAction = false,
}: StoreVisibilityBadgeProps) {
  const visibility = resolveVisibility(store, activeSubscription);

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${visibility.classes}`}
      >
        {visibility.isVisible ? (
          <Eye className="w-3.5 h-3.5" />
        ) : (
          <EyeOff className="w-3.5 h-3.5" />
        )}
        {visibility.isVisible ? "ظاهر للعامة" : "مخفي"}
      </span>
      {showReason && !visibility.isVisible && (
        <span className="text-[11px] text-muted-foreground dark:text-muted-foreground mr-1">
          السبب: {visibility.reason}
        </span>
      )}
      {showAssignAction && visibility.needsSubscription && (
        <Link
          href={`/subscriptions/new?store_public_id=${encodeURIComponent(store.public_id)}`}
          className="text-[11px] font-medium text-[#1E7D4E] hover:underline mr-1"
        >
          تعيين اشتراك جديد
        </Link>
      )}
    </div>
  );
}
