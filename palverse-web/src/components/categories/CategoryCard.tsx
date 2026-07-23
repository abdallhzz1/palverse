import Link from "next/link";
import { LucideIconByName } from "@/lib/lucide-icon";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName: string;
}

export function CategoryCard({ name, slug, iconName }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(
        "flex flex-col items-center justify-center p-4 aspect-square",
        "bg-white dark:bg-[#1F2522] rounded-xl",
        "border border-[#EAF3EC] dark:border-[#0F3D2E]",
        "hover:border-[#1E7D4E] hover:shadow-md transition-all group"
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 flex items-center justify-center mb-3 group-hover:bg-[#1E7D4E] transition-colors">
        <LucideIconByName
          name={iconName}
          className="w-6 h-6 text-[#1E7D4E] group-hover:text-white transition-colors"
        />
      </div>
      <span className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold text-sm text-center">
        {name}
      </span>
    </Link>
  );
}
