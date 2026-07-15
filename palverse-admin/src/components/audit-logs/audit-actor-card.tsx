import Link from "next/link";
import { AuditActor } from "@/types/audit-logs";
import { User, Shield, Briefcase, Bot } from "lucide-react";

interface AuditActorCardProps {
  actor: AuditActor | null;
}

export function AuditActorCard({ actor }: AuditActorCardProps) {
  if (!actor) {
    return <span className="text-muted-foreground text-sm italic">غير متوفر</span>;
  }

  const getActorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'admin': return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'merchant': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'user': return <User className="w-4 h-4 text-muted-foreground" />;
      case 'system': return <Bot className="w-4 h-4 text-purple-600" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const content = (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border">
        {getActorIcon(actor.type)}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground leading-tight">
          {actor.name || "مستخدم مجهول"}
        </span>
        {actor.email && (
          <span className="text-xs text-muted-foreground leading-tight">
            {actor.email}
          </span>
        )}
      </div>
    </div>
  );

  // Link to user if it's a known admin or user and we have their public ID
  if (actor.public_id && (actor.type === 'admin' || actor.type === 'user')) {
    return (
      <Link href={`/users/${actor.public_id}`} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
