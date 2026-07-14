import { Badge } from "@/components/ui/badge";

interface FaqStatusBadgeProps {
  isActive: boolean;
}

export function FaqStatusBadge({ isActive }: FaqStatusBadgeProps) {
  if (isActive) {
    return (
      <Badge className="bg-[#EAF3EC] text-[#1E7D4E] hover:bg-[#EAF3EC] hover:text-[#1E7D4E] border-[#7FA789]/30 border font-normal">
        فعال
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 hover:text-amber-600 border-amber-200 border font-normal">
      غير فعال
    </Badge>
  );
}
