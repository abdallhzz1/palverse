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
      href={`/stores?category=${slug}`}
      className={cn(
        "group flex aspect-square flex-col items-center justify-center rounded-xl border border-[#E2EAE5] bg-white p-4 transition-colors",
        "hover:border-[#2F6B4F]/40"
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] text-[#2F6B4F] transition-colors group-hover:border-[#2F6B4F]/35 group-hover:bg-[#E8EEEA]">
        <LucideIconByName name={iconName} className="h-6 w-6" />
      </div>
      <span className="text-center text-sm font-semibold text-[#1A3D32]">{name}</span>
    </Link>
  );
}
