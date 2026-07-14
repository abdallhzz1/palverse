import { AuditLog } from "@/types/audit-logs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock, Route, Globe, Monitor, Hash } from "lucide-react";

interface AuditTimelineProps {
  log: AuditLog;
}

export function AuditTimeline({ log }: AuditTimelineProps) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="relative border-r-2 border-slate-200 pr-6 space-y-8 pb-4">
        
        {/* Time Step */}
        <div className="relative">
          <div className="absolute -right-[31px] top-1 h-4 w-4 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              وقت العملية
            </span>
            <span className="text-sm text-slate-500 mt-1">
              {log.created_at ? format(new Date(log.created_at), "dd MMMM yyyy HH:mm:ss", { locale: ar }) : "-"}
            </span>
          </div>
        </div>

        {/* Network Step */}
        <div className="relative">
          <div className="absolute -right-[31px] top-1 h-4 w-4 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-400" />
              الشبكة
            </span>
            <div className="flex flex-col gap-1 mt-1 text-sm text-slate-500">
              <span><strong>عنوان IP:</strong> {log.ip_address || "-"}</span>
            </div>
          </div>
        </div>

        {/* Client Step */}
        <div className="relative">
          <div className="absolute -right-[31px] top-1 h-4 w-4 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-slate-400" />
              المتصفح/العميل
            </span>
            <div className="flex flex-col gap-1 mt-1 text-sm text-slate-500 break-words max-w-sm">
              {log.user_agent || "-"}
            </div>
          </div>
        </div>

        {/* System Step */}
        <div className="relative">
          <div className="absolute -right-[31px] top-1 h-4 w-4 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Route className="w-4 h-4 text-slate-400" />
              المسار
            </span>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 font-mono text-xs border border-slate-200">
                {log.method || "-"}
              </span>
              <span className="font-mono text-xs text-slate-600 truncate max-w-[200px]" title={log.route || ""}>
                {log.route || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Tracking Step */}
        <div className="relative">
          <div className="absolute -right-[31px] top-1 h-4 w-4 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-200 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-slate-400" />
              رقم الطلب
            </span>
            <span className="text-sm text-slate-500 mt-1 font-mono text-xs">
              {log.request_id || "-"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
