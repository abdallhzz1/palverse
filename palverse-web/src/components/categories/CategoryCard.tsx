import Link from "next/link";
import { Coffee, ShoppingBag, Utensils, Wrench, HeartPulse, Laptop, GraduationCap, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName: string;
}

export function CategoryCard({ name, slug, iconName }: CategoryCardProps) {
  // Simple icon mapper since we don't have images from backend yet
  const Icon = (() => {
    switch (iconName.toLowerCase()) {
      case "restaurant": return Utensils;
      case "cafe": return Coffee;
      case "shopping": return ShoppingBag;
      case "services": return Wrench;
      case "health": return HeartPulse;
      case "tech": return Laptop;
      case "education": return GraduationCap;
      case "travel": return Plane;
      default: return Grid;
    }
  })();

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

// Fallback icon
import { Grid } from "lucide-react";
