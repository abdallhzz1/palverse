import { AdminStore, StoreSubscriptionSummary } from "@/types/store";
import { Eye, EyeOff } from "lucide-react";

interface StoreVisibilityBadgeProps {
  store: AdminStore;
  activeSubscription?: StoreSubscriptionSummary | null;
  className?: string;
  showReason?: boolean;
}

export function StoreVisibilityBadge({ store, activeSubscription, className = "", showReason = true }: StoreVisibilityBadgeProps) {
  
  const determineVisibility = () => {
    if (store.status !== "approved") {
      return {
        isVisible: false,
        reason: "المحل غير معتمد",
        classes: "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-muted-foreground border border-border dark:border-slate-700"
      };
    }
    
    if (!store.is_active) {
      return {
        isVisible: false,
        reason: "المحل غير نشط",
        classes: "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-muted-foreground border border-border dark:border-slate-700"
      };
    }

    if (!activeSubscription || activeSubscription.status !== "active" || !activeSubscription.is_currently_valid) {
      return {
        isVisible: false,
        reason: "لا يوجد اشتراك نشط",
        classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
      };
    }

    return {
      isVisible: true,
      reason: "ظاهر للعامة",
      classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
    };
  };

  const visibility = determineVisibility();

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${visibility.classes}`}>
        {visibility.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        {visibility.isVisible ? "ظاهر للعامة" : "مخفي"}
      </span>
      {showReason && !visibility.isVisible && (
        <span className="text-[11px] text-muted-foreground dark:text-muted-foreground mr-1">
          السبب: {visibility.reason}
        </span>
      )}
    </div>
  );
}
