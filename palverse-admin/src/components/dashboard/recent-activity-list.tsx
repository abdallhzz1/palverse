import { RecentActivityItem } from "@/types/analytics";
import { formatDateTime } from "@/lib/utils/formatters";
import { Activity, Clock, User } from "lucide-react";

interface RecentActivityListProps {
  items: RecentActivityItem[];
}

export function RecentActivityList({ items }: RecentActivityListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 text-muted-foreground">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Activity className="h-7 w-7 opacity-40" />
        </div>
        <p className="font-medium">لا يوجد نشاط حديث</p>
        <p className="mt-1 text-sm">ستظهر هنا آخر العمليات على المنصة</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.public_id || index}
          className="group relative flex gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
        >
          <div className="relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F3D2E] text-white dark:bg-[#1E7D4E]">
            <Activity className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{item.action}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span dir="ltr">{formatDateTime(item.created_at)}</span>
              </div>
            </div>

            {item.user_name && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                <User className="h-3 w-3" />
                {item.user_name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
