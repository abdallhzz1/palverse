import Link from "next/link";
import { LucideIconByName } from "@/lib/lucide-icon";

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName?: string;
}

export function CategoryCard({ name, slug, iconName }: CategoryCardProps) {
  return (
    <Link
      href={`/stores?category=${slug}`}
      className="group flex flex-col items-center justify-start gap-2.5"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#EAF3EC] bg-white text-[#1E7D4E] shadow-[0_4px_20px_-8px_rgba(15,61,46,0.12)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#1E7D4E]/30 group-hover:bg-[#EAF3EC] sm:h-[4.5rem] sm:w-[4.5rem]">
        <LucideIconByName name={iconName} className="h-7 w-7 sm:h-8 sm:w-8" />
      </div>
      <h3 className="line-clamp-2 px-1 text-center text-[11px] font-bold leading-tight text-[#0F3D2E] sm:text-xs">
        {name}
      </h3>
    </Link>
  );
}
