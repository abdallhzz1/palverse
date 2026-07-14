import { Badge } from "@/components/ui/badge";

export function PlanStatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge className="bg-[#EAF3EC] text-[#1E7D4E] hover:bg-[#EAF3EC]/80 border-none px-2 py-0.5 font-medium">
        نشطة
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100/80 border-none px-2 py-0.5 font-medium">
      غير نشطة
    </Badge>
  );
}
