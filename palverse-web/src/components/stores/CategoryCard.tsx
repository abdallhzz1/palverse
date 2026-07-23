import Link from "next/link";
import { LucideIconByName } from "@/lib/lucide-icon";

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName?: string;
}

export function CategoryCard({ name, slug, iconName }: CategoryCardProps) {
  return (
    <Link href={`/stores?category=${slug}`} className="flex flex-col items-center justify-start group">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm border border-emerald-50 flex items-center justify-center mb-2 transition-all group-hover:scale-110 group-hover:shadow-md group-hover:bg-emerald-50 text-[#1E7D4E]">
        <LucideIconByName name={iconName} className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <h3 className="font-bold text-[#0F3D2E] text-center text-[10px] sm:text-xs leading-tight line-clamp-2 px-1">{name}</h3>
    </Link>
  );
}
