import { serverFetch } from "@/lib/api/server";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { LucideIconByName } from "@/lib/lucide-icon";
import Link from "next/link";

export const metadata = {
  title: "الفئات | بال فيرس",
  description: "تصفح جميع فئات المتاجر والخدمات المتوفرة على منصة بال فيرس.",
};

export default async function CategoriesPage() {
  let categories: Record<string, unknown>[] = [];
  let error = false;

  try {
    const data = await serverFetch<{ data: Record<string, unknown>[] }>("/categories");
    categories = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    error = true;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6]/50">
      <PublicPageHero
        imageSrc={BRAND_PHOTOS.categories}
        imageAlt="واجهات محلات فلسطينية متنوعة"
        title="تصفح جميع الفئات"
        subtitle="اكتشف المتاجر، المطاعم، والخدمات المميزة الموزعة عبر الفئات المختلفة في جميع المدن الفلسطينية."
        size="page"
        priority
      />

      <section className="public-container relative z-20 -mt-10 pb-28 md:-mt-14">
        {error ? (
          <div className="public-card text-center py-16 text-red-600 border-red-100 max-w-3xl mx-auto">
            <p className="font-bold text-lg">عذراً، حدث خطأ أثناء جلب الفئات.</p>
          </div>
        ) : categories.length === 0 ? (
          <EmptyStateArt title="لا توجد فئات حالياً" description="لم يتم إضافة أي فئات بعد في المنصة." className="max-w-2xl mx-auto" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((cat, i) => {
              const name = (cat.name_ar as string) || (cat.name_en as string) || "فئة غير معروفة";
              const slug = cat.slug as string;
              const publicId = (cat.public_id as string) || (cat.publicId as string) || String(i);
              const iconName = cat.icon as string | undefined;
              const target = slug || publicId;

              return (
                <Link
                  href={`/stores?category=${target}`}
                  key={publicId}
                  className="public-card group flex flex-col items-center gap-4 p-6 text-center hover:-translate-y-1"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3EC] text-[#1E7D4E] transition-colors duration-300 group-hover:bg-[#1E7D4E] group-hover:text-white md:h-20 md:w-20">
                    <LucideIconByName name={iconName} className="h-7 w-7 md:h-9 md:w-9" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-sm font-bold text-[#0F3D2E] transition-colors group-hover:text-[#1E7D4E] md:text-base">
                      {name}
                    </h3>
                    <span className="text-xs font-medium text-[#7FA789]">استعرض الأعمال</span>
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
