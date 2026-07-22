import Link from "next/link";
import { 
  Grid, ShoppingBag, Coffee, HeartPulse, Building2, Car, Dumbbell, 
  BookOpen, Utensils, Smartphone, Home, Wrench, Apple, Gift, Scissors 
} from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName?: string;
}

export function CategoryCard({ name, slug, iconName }: CategoryCardProps) {
  const getIcon = () => {
    // If an explicit icon name is passed from DB and we have a mapping for it
    if (iconName && iconName !== "grid") {
       // handle explicit icons if needed later
    }

    // Map by slug as fallback (since our DB doesn't have icons seeded yet)
    switch(slug.toLowerCase()) {
      case "restaurants": return <Utensils className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "cafes-sweets": return <Coffee className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "fashion-clothing": return <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "electronics-mobile": return <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "furniture-home": return <Home className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "home-services": return <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "health-beauty": return <HeartPulse className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "education-training": return <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "automotive": return <Car className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "groceries": return <Apple className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "gifts-flowers": return <Gift className="w-6 h-6 sm:w-7 sm:h-7" />;
      case "local-crafts": return <Scissors className="w-6 h-6 sm:w-7 sm:h-7" />;
      default: return <Grid className="w-6 h-6 sm:w-7 sm:h-7" />;
    }
  };

  return (
    <Link href={`/stores?category=${slug}`} className="flex flex-col items-center justify-start group">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm border border-emerald-50 flex items-center justify-center mb-2 transition-all group-hover:scale-110 group-hover:shadow-md group-hover:bg-emerald-50 text-[#1E7D4E]">
        {getIcon()}
      </div>
      <h3 className="font-bold text-[#0F3D2E] text-center text-[10px] sm:text-xs leading-tight line-clamp-2 px-1">{name}</h3>
    </Link>
  );
}
