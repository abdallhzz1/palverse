import Link from "next/link";
import {
  Apple,
  BookOpen,
  Car,
  Coffee,
  Gift,
  Grid,
  HeartPulse,
  Home,
  Scissors,
  ShoppingBag,
  Smartphone,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName: string;
}

const ICON_BY_NAME: Record<string, LucideIcon> = {
  grid: Grid,
  restaurant: Utensils,
  cafe: Coffee,
  shopping: ShoppingBag,
  tech: Smartphone,
  home: Home,
  services: Wrench,
  health: HeartPulse,
  education: BookOpen,
  automotive: Car,
  groceries: Apple,
  gifts: Gift,
  crafts: Scissors,
};

export function CategoryCard({ name, slug, iconName }: CategoryCardProps) {
  const Icon = ICON_BY_NAME[iconName?.toLowerCase()] || Grid;

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
        <Icon className="w-6 h-6 text-[#1E7D4E] group-hover:text-white transition-colors" />
      </div>
      <span className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold text-sm text-center">
        {name}
      </span>
    </Link>
  );
}
