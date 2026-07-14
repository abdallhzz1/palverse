"use client";

import { useAuditLogDetails } from "@/hooks/use-audit-logs";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Activity, Database, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditActionBadge } from "@/components/audit-logs/audit-action-badge";
import { AuditActorCard } from "@/components/audit-logs/audit-actor-card";
import { AuditEntityBadge } from "@/components/audit-logs/audit-entity-badge";
import { AuditChangesViewer } from "@/components/audit-logs/audit-changes-viewer";
import { AuditTimeline } from "@/components/audit-logs/audit-timeline";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AuditLogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = params.publicId as string;

  const { data: log, isLoading, error } = useAuditLogDetails(publicId);

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="h-[400px] w-full bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
      </main>
    );
  }

  if (error || !log) {
    return (
      <main className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-slate-800">خطأ</h2>
        </div>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex items-center justify-center">
          {error?.message || "تعذر العثور على تفاصيل السجل."}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                تفاصيل العملية
              </h2>
              <AuditActionBadge action={log.action} />
            </div>
            <span className="text-sm text-slate-500 font-mono mt-1">ID: {log.public_id}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          {log.created_at ? format(new Date(log.created_at), "dd MMMM yyyy, HH:mm", { locale: ar }) : "-"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Activity className="w-5 h-5 text-slate-400" />
              أطراف العملية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">المنفذ (Actor)</span>
                <AuditActorCard actor={log.actor} />
              </div>
              
              <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">العنصر (Subject)</span>
                <AuditEntityBadge subject={log.subject} />
              </div>
            </div>
          </div>

          {/* Changes Viewer */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Database className="w-5 h-5 text-slate-400" />
              تفاصيل التغييرات
            </h3>
            
            <AuditChangesViewer oldValues={log.old_values} newValues={log.new_values} />
          </div>
        </div>

        {/* Sidebar / Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-medium text-slate-800 mb-6">المعلومات التقنية</h3>
            <AuditTimeline log={log} />
          </div>
        </div>
      </div>
    </main>
  );
}
