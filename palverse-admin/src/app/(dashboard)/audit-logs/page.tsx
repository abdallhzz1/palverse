import { AuditLogsList } from "@/components/audit-logs/audit-logs-list";

export const metadata = {
  title: "سجل العمليات | Palverse",
};

export default function AuditLogsPage() {
  return (
    <main className="p-6">
      <AuditLogsList />
    </main>
  );
}
