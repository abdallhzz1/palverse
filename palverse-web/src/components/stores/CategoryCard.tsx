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
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#E2EAE5] bg-white text-[#2F6B4F] transition-colors group-hover:border-[#2F6B4F]/40 group-hover:bg-[#E8EEEA] sm:h-[4.25rem] sm:w-[4.25rem]">
        <LucideIconByName name={iconName} className="h-7 w-7 sm:h-8 sm:w-8" />
      </div>
      <h3 className="line-clamp-2 px-1 text-center text-[11px] font-bold leading-tight text-[#1A3D32] sm:text-xs">
        {name}
      </h3>
    </Link>
  );
}
