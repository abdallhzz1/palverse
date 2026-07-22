import { Suspense } from "react";
import { StoreListFilters } from "@/components/stores/StoreListFilters";
import { StoreCard } from "@/components/stores/StoreCard";
import { serverFetch } from "@/lib/api/server";
import { IslamicPatternBackground } from "@/components/brand/IslamicPatternBackground";
import Link from "next/link";
import { Store, SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "استكشف المتاجر | بال فيرس",
  description: "تصفح أفضل الأعمال والخدمات في جميع مناطق فلسطين.",
};

export default async function StoresPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const query    = typeof searchParams.query    === "string" ? searchParams.query    : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const city     = typeof searchParams.city     === "string" ? searchParams.city     : undefined;
  const sort     = typeof searchParams.sort     === "string" ? searchParams.sort     : "newest";
  const page     = typeof searchParams.page     === "string" ? searchParams.page     : "1";

  let storesData: any  = null;
  let bootstrapData: any = null;
  let error = false;

  try {
    const [storesRes, bootstrapRes] = await Promise.all([
      serverFetch<{ data: any[]; meta: any }>("/stores", { params: { query, category, city, sort, page } }),
      serverFetch<{ data: { categories: any[]; cities: any[] } }>("/bootstrap"),
    ]);
    storesData    = storesRes;
    bootstrapData = bootstrapRes;
  } catch (err) {
    console.error("Failed to fetch stores data", err);
    error = true;
  }

  const stores     = storesData?.data     || [];
  const meta       = storesData?.meta     || {};
  const categories = bootstrapData?.data?.categories || [];
  const cities     = bootstrapData?.data?.cities     || [];

  const hasActiveFilters = !!(query || category || city);

  return (
    <div className="min-h-screen bg-[#F5F7F6]/50 dark:bg-[#111714]">

      {/* ── Hero ── */}
      <section className="relative w-full bg-[#0F3D2E] pt-20 md:pt-28 pb-28 md:pb-40 overflow-hidden">
        {/* decorative glows */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#1E7D4E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#0a2e1e]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute inset-0 opacity-10 pointer-events-none text-white">
          <IslamicPatternBackground />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 text-[#EAF3EC] px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20 backdrop-blur-sm">
            <SlidersHorizontal className="w-4 h-4" />
            استكشاف المتاجر
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight">
            اكتشف أفضل الأعمال
          </h1>
          <p className="text-[#A8C5B0] text-lg md:text-xl max-w-2xl mx-auto">
            تصفح أفضل الأعمال والخدمات المتوفرة في جميع المحافظات والمدن الفلسطينية بكل سهولة.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="container mx-auto px-4 -mt-14 md:-mt-16 relative z-20 pb-28">

        {/* Filter Bar */}
        <Suspense
          fallback={
            <div className="w-full h-16 bg-white dark:bg-[#1F2522] shadow-md rounded-2xl animate-pulse mb-10 max-w-5xl mx-auto" />
          }
        >
          <StoreListFilters categories={categories} cities={cities} />
        </Suspense>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-[#7FA789] font-medium">نتائج البحث:</span>
            {query    && <span className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] px-3 py-1 rounded-full text-xs font-bold">"{query}"</span>}
            {category && <span className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] px-3 py-1 rounded-full text-xs font-bold">{category}</span>}
            {city     && <span className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] px-3 py-1 rounded-full text-xs font-bold">{city}</span>}
            {meta.total !== undefined && (
              <span className="text-[#7FA789] text-xs">{meta.total} نتيجة</span>
            )}
          </div>
        )}

        {/* Grid / Empty / Error */}
        <div className="w-full">
          {error ? (
            <div className="text-center py-24 bg-white dark:bg-[#1F2522] shadow-sm text-red-600 rounded-3xl border border-red-100 dark:border-red-900/30 max-w-3xl mx-auto">
              <p className="font-bold text-lg">عذراً، حدث خطأ أثناء جلب المتاجر.</p>
              <p className="text-sm mt-2 text-red-400">يرجى المحاولة مرة أخرى لاحقاً.</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-[#1F2522] shadow-sm rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-[#EAF3EC] dark:bg-[#0F3D2E]/30 rounded-full flex items-center justify-center mb-6">
                <Store className="w-10 h-10 text-[#7FA789]" />
              </div>
              <p className="font-bold text-xl text-[#0F3D2E] dark:text-[#EAF3EC] mb-3">
                لا توجد نتائج مطابقة
              </p>
              <p className="text-[#7FA789] text-sm max-w-sm">
                جرّب البحث بكلمات مختلفة أو تغيير إعدادات الفلترة.
              </p>
            </div>
          ) : (
            <>
              {/* ✦ 2-col on mobile, 3 on md, 4 on xl */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {stores.map((store: any) => (
                  <StoreCard
                    key={store.slug}
                    name={store.name_ar || store.name_en || ""}
                    slug={store.slug}
                    categoryName={store.category?.name_ar || store.category?.name_en || ""}
                    cityName={store.zone?.city?.name_ar || store.zone?.city?.name_en || ""}
                    coverImage={store.cover?.url}
                    logoImage={store.logo?.url}
                    averageRating={store.published_reviews_avg_rating ? Number(store.published_reviews_avg_rating) : undefined}
                    ratingsCount={store.published_reviews_count ? Number(store.published_reviews_count) : undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="mt-16 flex justify-center items-center gap-3 flex-wrap">
                  {meta.current_page > 1 && (
                    <Link
                      href={`/stores?${new URLSearchParams({ ...searchParams as any, page: (meta.current_page - 1).toString() }).toString()}`}
                      className="px-6 py-2.5 bg-white dark:bg-[#1F2522] border border-gray-200 dark:border-gray-700 rounded-xl text-[#0F3D2E] dark:text-[#EAF3EC] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      السابق
                    </Link>
                  )}

                  <span className="px-5 py-2.5 bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] rounded-xl font-bold shadow-sm">
                    {meta.current_page} من {meta.last_page}
                  </span>

                  {meta.current_page < meta.last_page && (
                    <Link
                      href={`/stores?${new URLSearchParams({ ...searchParams as any, page: (meta.current_page + 1).toString() }).toString()}`}
                      className="px-6 py-2.5 bg-white dark:bg-[#1F2522] border border-gray-200 dark:border-gray-700 rounded-xl text-[#0F3D2E] dark:text-[#EAF3EC] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      التالي
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
