import { serverFetch } from "@/lib/api/server";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
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
    <div className="min-h-screen bg-[#F7F9F8]">
      <PublicPageHero
        title="تصفح جميع الفئات"
        subtitle="اكتشف المتاجر والخدمات حسب الفئة في المدن الفلسطينية."
        size="page"
      />

      <section className="public-container pb-28 pt-8">
        {error ? (
          <div className="public-card mx-auto max-w-3xl border-red-100 py-16 text-center text-red-600">
            <p className="text-lg font-bold">عذراً، حدث خطأ أثناء جلب الفئات.</p>
          </div>
        ) : categories.length === 0 ? (
          <EmptyStateArt
            title="لا توجد فئات حالياً"
            description="لم يتم إضافة أي فئات بعد في المنصة."
            className="mx-auto max-w-2xl"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((cat, i) => {
              const name = (cat.name_ar as string) || (cat.name_en as string) || "فئة غير معروفة";
              const slug = cat.slug as string;
              const publicId = (cat.public_id as string) || (cat.publicId as string) || String(i);
              const iconName = cat.icon as string | undefined;
              const target = slug || publicId;

              return (
                <Link
                  key={publicId}
                  href={`/stores?category=${encodeURIComponent(target)}`}
                  className="public-card group flex flex-col items-center gap-3 p-5 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] text-[#2F6B4F] transition-colors group-hover:border-[#2F6B4F]/35 group-hover:bg-[#E8EEEA]">
                    <LucideIconByName name={iconName} className="h-6 w-6" />
                  </div>
                  <span className="font-heading text-sm font-bold text-[#1A3D32]">{name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
