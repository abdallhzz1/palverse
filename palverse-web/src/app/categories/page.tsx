import { serverFetch } from "@/lib/api/server";
import { IslamicPatternBackground } from "@/components/brand/IslamicPatternBackground";
import Link from "next/link";
import type { ReactNode } from "react";
import { 
  Grid, ShoppingBag, Coffee, HeartPulse, Car, 
  BookOpen, Utensils, Smartphone, Home, Wrench, Apple, Gift, Scissors, ArrowLeft 
} from "lucide-react";

function getCategoryIcon(slug: string, iconName?: string) {
  const byIcon: Record<string, ReactNode> = {
    restaurant: <Utensils className="w-7 h-7 text-[#1E7D4E]" />,
    cafe: <Coffee className="w-7 h-7 text-[#1E7D4E]" />,
    shopping: <ShoppingBag className="w-7 h-7 text-[#1E7D4E]" />,
    tech: <Smartphone className="w-7 h-7 text-[#1E7D4E]" />,
    home: <Home className="w-7 h-7 text-[#1E7D4E]" />,
    services: <Wrench className="w-7 h-7 text-[#1E7D4E]" />,
    health: <HeartPulse className="w-7 h-7 text-[#1E7D4E]" />,
    education: <BookOpen className="w-7 h-7 text-[#1E7D4E]" />,
    automotive: <Car className="w-7 h-7 text-[#1E7D4E]" />,
    groceries: <Apple className="w-7 h-7 text-[#1E7D4E]" />,
    gifts: <Gift className="w-7 h-7 text-[#1E7D4E]" />,
    crafts: <Scissors className="w-7 h-7 text-[#1E7D4E]" />,
  };

  if (iconName && byIcon[iconName.toLowerCase()]) {
    return byIcon[iconName.toLowerCase()];
  }

  switch (slug.toLowerCase()) {
    case "restaurants": return <Utensils className="w-7 h-7 text-[#1E7D4E]" />;
    case "cafes-sweets": return <Coffee className="w-7 h-7 text-[#1E7D4E]" />;
    case "fashion-clothing": return <ShoppingBag className="w-7 h-7 text-[#1E7D4E]" />;
    case "electronics-mobile": return <Smartphone className="w-7 h-7 text-[#1E7D4E]" />;
    case "furniture-home": return <Home className="w-7 h-7 text-[#1E7D4E]" />;
    case "home-services": return <Wrench className="w-7 h-7 text-[#1E7D4E]" />;
    case "health-beauty": return <HeartPulse className="w-7 h-7 text-[#1E7D4E]" />;
    case "education-training": return <BookOpen className="w-7 h-7 text-[#1E7D4E]" />;
    case "automotive": return <Car className="w-7 h-7 text-[#1E7D4E]" />;
    case "groceries": return <Apple className="w-7 h-7 text-[#1E7D4E]" />;
    case "gifts-flowers": return <Gift className="w-7 h-7 text-[#1E7D4E]" />;
    case "local-crafts": return <Scissors className="w-7 h-7 text-[#1E7D4E]" />;
    default: return <Grid className="w-7 h-7 text-[#1E7D4E]" />;
  }
}

export default async function CategoriesPage() {
  let categories: Record<string, unknown>[] = [];
  let error = false;

  try {
    const data = await serverFetch<{ data: Record<string, unknown>[] }>('/categories');
    categories = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    error = true;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6]/50">
      
      {/* Categories Hero Section */}
      <section className="relative w-full bg-[#0F3D2E] pt-20 md:pt-28 pb-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <IslamicPatternBackground />
        </div>
        
        {/* Soft radial gradient to add depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E7D4E]/30 via-[#0F3D2E]/80 to-[#0F3D2E] opacity-50 z-0 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            تصفح جميع الفئات
          </h1>
          <p className="text-lg md:text-xl text-[#EAF3EC] max-w-2xl mx-auto font-medium">
            اكتشف المتاجر، المطاعم، والخدمات المميزة الموزعة عبر الفئات المختلفة في جميع المدن الفلسطينية.
          </p>
        </div>
        
        {/* Bottom curve separator */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-[#F5F7F6]/50" 
          style={{ borderTopLeftRadius: '50% 100%', borderTopRightRadius: '50% 100%' }} 
        />
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-20 pb-24">
        {error ? (
          <div className="text-center py-16 bg-white shadow-sm text-red-600 rounded-3xl border border-red-100 max-w-3xl mx-auto">
            <p className="font-bold text-lg">عذراً، حدث خطأ أثناء جلب الفئات.</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-[#7FA789] py-16 bg-white shadow-sm rounded-3xl border border-dashed border-gray-200 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-2">لا توجد فئات حالياً</h3>
            <p>لم يتم إضافة أي فئات بعد في المنصة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, i) => {
              const name = (cat.name_ar as string) || (cat.name_en as string) || "فئة غير معروفة";
              const slug = cat.slug as string;
              const publicId = (cat.public_id as string) || (cat.publicId as string) || String(i);
              const iconName = cat.icon as string;

              return (
                <Link 
                  href={`/stores?category=${slug}`} 
                  key={publicId}
                  className="group bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#1E7D4E] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex items-center justify-between hover:-translate-y-1.5"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon Container */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#F5F7F6] group-hover:bg-[#EAF3EC] transition-colors flex items-center justify-center shrink-0">
                      {getCategoryIcon(slug, iconName)}
                    </div>
                    {/* Text */}
                    <div className="flex flex-col">
                      <h3 className="font-bold text-[#0F3D2E] text-lg mb-1 group-hover:text-[#1E7D4E] transition-colors">{name}</h3>
                      <span className="text-xs md:text-sm text-[#7FA789] font-medium">استعرض الأعمال</span>
                    </div>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1E7D4E] transition-colors shrink-0 mr-2">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
