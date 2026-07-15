import { Badge } from "@/components/ui/badge";

interface PageStatusBadgeProps {
  isPublished: boolean;
}

export function PageStatusBadge({ isPublished }: PageStatusBadgeProps) {
  if (isPublished) {
    return (
      <Badge className="bg-[#EAF3EC] text-[#1E7D4E] hover:bg-[#EAF3EC] hover:text-[#1E7D4E] border-[#7FA789]/30 border font-normal">
        منشورة
      </Badge>
    );
  }

  return (
    <Badge className="bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground border-border border font-normal">
      غير منشورة
    </Badge>
  );
}
