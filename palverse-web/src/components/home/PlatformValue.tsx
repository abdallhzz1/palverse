import { Search, Grid, MapPin, Heart, Star, ShieldCheck } from "lucide-react";
import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";

export function PlatformValue() {
  const values = [
    {
      icon: <Search className="w-8 h-8 text-[#1E7D4E]" />,
      title: "بحث ذكي وسريع",
      description: "عثور فوري على الأنشطة والمتاجر التي تناسب احتياجاتك."
    },
    {
      icon: <Grid className="w-8 h-8 text-[#1E7D4E]" />,
      title: "تصنيفات منظمة",
      description: "اكتشف الخدمات مرتبة بدقة لسهولة الوصول."
    },
    {
      icon: <MapPin className="w-8 h-8 text-[#1E7D4E]" />,
      title: "احتياجات وموقعك",
      description: "أقرب المتاجر لك بناءً على مدينتك ومنطقتك."
    },
    {
      icon: <Heart className="w-8 h-8 text-[#1E7D4E]" />,
      title: "دعم الأعمال المحلية",
      description: "اكتشف وادعم المشاريع الوطنية."
    },
    {
      icon: <Star className="w-8 h-8 text-[#1E7D4E]" />,
      title: "عروض ومزايا",
      description: "أحدث العروض الحصرية من شركائنا الموثوقين."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#1E7D4E]" />,
      title: "هوية محلية أصيلة",
      description: "دليل موثوق يعكس الثقافة والبيئة الفلسطينية."
    }
  ];

  return (
    <section className="py-16 bg-[#F9FBF9] dark:bg-[#171717] border-t border-[#EAF3EC] dark:border-[#0F3D2E]">
      <div className="container mx-auto px-4">
        <BrandSectionHeading title="لماذا دليل فلسطين؟" subtitle="كل فلسطين في دليل واحد" className="mb-12" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div key={i} className="flex flex-col items-start p-6 bg-white dark:bg-[#1F2522] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E]">
              <div className="p-3 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 rounded-xl mb-4">
                {v.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">{v.title}</h3>
              <p className="text-[#7FA789] text-base leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
