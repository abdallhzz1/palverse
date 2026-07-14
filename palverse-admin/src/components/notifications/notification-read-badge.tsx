import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck } from "lucide-react";

export function NotificationReadBadge({ isRead }: { isRead: boolean }) {
  if (isRead) {
    return (
      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none flex items-center w-fit gap-1 font-medium px-2 py-0.5">
        <CheckCheck className="h-3 w-3" />
        مقروء
      </Badge>
    );
  }

  return (
    <Badge className="bg-[#1E7D4E]/10 text-[#1E7D4E] hover:bg-[#1E7D4E]/20 border-none flex items-center w-fit gap-1 font-semibold px-2 py-0.5">
      <Check className="h-3 w-3" />
      غير مقروء
    </Badge>
  );
}
