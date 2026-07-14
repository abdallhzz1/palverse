import { RecentActivityItem } from "@/types/dashboard";
import { formatDateTime } from "@/lib/utils/formatters";
import { Activity, Clock } from "lucide-react";

interface RecentActivityListProps {
  items: RecentActivityItem[];
}

export function RecentActivityList({ items }: RecentActivityListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
        <Activity className="w-12 h-12 mb-4 opacity-20" />
        <p>لا يوجد نشاطات حديثة لعرضها</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-2">
      {items.map((item, index) => (
        <div key={item.id || item.public_id || index} className="relative pl-4 rtl:pl-0 rtl:pr-4">
          {/* Timeline connecting line */}
          {index !== items.length - 1 && (
            <div className="absolute top-8 left-[11px] rtl:left-auto rtl:right-[11px] bottom-[-24px] w-px bg-slate-100 dark:bg-slate-800" />
          )}
          
          <div className="flex gap-4">
            <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 ring-4 ring-white dark:ring-[#1F2522]">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.action}
                </h4>
                <div className="flex items-center text-xs text-slate-400">
                  <Clock className="w-3 h-3 ml-1" />
                  <span dir="ltr">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
              {item.user_name && (
                <div className="mt-2 text-xs font-medium px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded w-fit">
                  بواسطة: {item.user_name}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
