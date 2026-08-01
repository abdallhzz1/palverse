import { Suspense } from "react";
import { StoreListFilters } from "@/components/stores/StoreListFilters";
import { StoreCard } from "@/components/stores/StoreCard";
import { serverFetch } from "@/lib/api/server";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import Link from "next/link";

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
  const zone     = typeof searchParams.zone     === "string" ? searchParams.zone     : undefined;
  const sort     = typeof searchParams.sort     === "string" ? searchParams.sort     : "newest";
  const page     = typeof searchParams.page     === "string" ? searchParams.page     : "1";

  let storesData: any  = null;
  let bootstrapData: any = null;
  let error = false;

  try {
    const [storesRes, bootstrapRes] = await Promise.all([
      serverFetch<{ data: any[]; meta: any }>("/stores", { params: { query, category, city, zone, sort, page } }),
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

  const hasActiveFilters = !!(query || category || city || zone);

  return (
    <div className="min-h-screen bg-[#F5F7F6]/50 dark:bg-[#111714]">

      {/* ── Hero ── */}
      <PublicPageHero
        imageSrc={BRAND_PHOTOS.stores}
        imageAlt="شارع تجاري فلسطيني بواجهات متاجر متنوعة"
        title="اكتشف أفضل الأعمال"
        subtitle="تصفح أفضل الأعمال والخدمات المتوفرة في جميع المحافظات والمدن الفلسطينية بكل سهولة."
        size="page"
        priority
      />

      {/* ── Main Content ── */}
      <section className="public-container relative z-20 -mt-10 pb-28 md:-mt-14">

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
            {city     && <span className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] px-3 py-1 rounded-full text-xs font-bold">مدينة</span>}
            {zone     && <span className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] px-3 py-1 rounded-full text-xs font-bold">منطقة</span>}
            {meta.total !== undefined && (
              <span className="text-[#7FA789] text-xs">{meta.total} نتيجة</span>
            )}
          </div>
        )}

        {/* Grid / Empty / Error */}
        <div className="w-full">
          {error ? (
            <div className="public-card text-center py-24 text-red-600 border-red-100 dark:border-red-900/30 max-w-3xl mx-auto">
              <p className="font-bold text-lg">عذراً، حدث خطأ أثناء جلب المتاجر.</p>
              <p className="text-sm mt-2 text-red-400">يرجى المحاولة مرة أخرى لاحقاً.</p>
            </div>
          ) : stores.length === 0 ? (
            <EmptyStateArt
              title="لا توجد نتائج مطابقة"
              description="جرّب البحث بكلمات مختلفة أو تغيير إعدادات الفلترة."
              className="max-w-2xl mx-auto"
            />
          ) : (
            <>
              {/* ✦ 2-col on mobile, 3 on md, 4 on xl */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {stores.map((store: any) => (
                  <StoreCard
                    key={store.slug || store.public_id}
                    name={store.name_ar || store.name_en || ""}
                    slug={store.slug}
                    publicId={store.public_id}
                    categoryName={store.category?.name_ar || store.category?.name_en || ""}
                    tags={(store.categories || []).map((c: any) => c.name_ar || c.name_en).filter(Boolean)}
                    cityName={store.city?.name_ar || store.city?.name_en || ""}
                    zoneName={store.zone?.name_ar || store.zone?.name_en || ""}
                    coverImage={store.cover?.url}
                    logoImage={store.logo?.url}
                    verified={Boolean(store.is_verified)}
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
