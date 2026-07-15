import { AuditSubject } from "@/types/audit-logs";
import { Badge } from "@/components/ui/badge";

interface AuditEntityBadgeProps {
  subject: AuditSubject | null;
}

export function AuditEntityBadge({ subject }: AuditEntityBadgeProps) {
  if (!subject) {
    return <span className="text-muted-foreground text-sm italic">غير متوفر</span>;
  }

  const getTypeLabel = (type: string) => {
    // Strip namespaces if present (e.g., App\Models\User -> User)
    const normalizedType = type.split('\\').pop() || type;

    switch (normalizedType.toLowerCase()) {
      case 'user': return 'مستخدم';
      case 'store': return 'محل';
      case 'offer': return 'عرض';
      case 'subscription': return 'اشتراك';
      case 'subscriptionplan': return 'باقة اشتراك';
      case 'category': return 'تصنيف';
      case 'staticpage': return 'صفحة ثابتة';
      case 'faq': return 'سؤال شائع';
      case 'systemsetting': return 'إعدادات النظام';
      case 'session': return 'جلسة مسجلة';
      case 'city': return 'مدينة';
      case 'zone': return 'منطقة';
      default: return normalizedType;
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge className="bg-muted text-slate-700 font-normal text-xs border border-border hover:bg-muted">
        {getTypeLabel(subject.type)}
      </Badge>
      {subject.label && (
        <span className="text-sm text-muted-foreground truncate max-w-[200px]" title={subject.label}>
          {subject.label}
        </span>
      )}
    </div>
  );
}
