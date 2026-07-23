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

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName?: string;
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

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  restaurants: Utensils,
  "cafes-sweets": Coffee,
  "fashion-clothing": ShoppingBag,
  "electronics-mobile": Smartphone,
  "furniture-home": Home,
  "home-services": Wrench,
  "health-beauty": HeartPulse,
  "education-training": BookOpen,
  automotive: Car,
  groceries: Apple,
  "gifts-flowers": Gift,
  "local-crafts": Scissors,
};

export function CategoryCard({ name, slug, iconName }: CategoryCardProps) {
  const Icon =
    (iconName && ICON_BY_NAME[iconName.toLowerCase()]) ||
    ICON_BY_SLUG[slug.toLowerCase()] ||
    Grid;

  return (
    <Link href={`/stores?category=${slug}`} className="flex flex-col items-center justify-start group">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm border border-emerald-50 flex items-center justify-center mb-2 transition-all group-hover:scale-110 group-hover:shadow-md group-hover:bg-emerald-50 text-[#1E7D4E]">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <h3 className="font-bold text-[#0F3D2E] text-center text-[10px] sm:text-xs leading-tight line-clamp-2 px-1">{name}</h3>
    </Link>
  );
}
