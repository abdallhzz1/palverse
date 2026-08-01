import { Suspense } from "react";
import { StoreListFilters } from "@/components/stores/StoreListFilters";
import { StoreCard } from "@/components/stores/StoreCard";
import { serverFetch } from "@/lib/api/server";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
import { AdBannerSlot } from "@/components/ads/AdBannerSlot";
import { FeaturedStoresStrip } from "@/components/ads/FeaturedStoresStrip";
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
  const isFirstPage = String(page) === "1";

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <PublicPageHero
        title="اكتشف أفضل الأعمال"
        subtitle="تصفح الأعمال والخدمات في المحافظات والمدن الفلسطينية."
        size="page"
      />

      <section className="public-container pb-28 pt-8">

        <Suspense
          fallback={
            <div className="w-full h-16 bg-white border border-[#E2EAE5] rounded-xl animate-pulse mb-10 max-w-5xl mx-auto" />
          }
        >
          <StoreListFilters categories={categories} cities={cities} />
        </Suspense>

        <div className="mb-8">
          <AdBannerSlot placement="stores_list" variant="inline" embedded />
        </div>

        {isFirstPage ? (
          <div className="mb-10">
            <FeaturedStoresStrip
              title="محلات مميزة"
              subtitle="إعلانات ممولة تظهر أولاً في نتائج التصفح"
              limit={4}
              embedded
            />
          </div>
        ) : null}

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-[#6B8578] font-medium">نتائج البحث:</span>
            {query    && <span className="bg-[#E8EEEA] text-[#2F6B4F] px-3 py-1 rounded-lg text-xs font-bold">"{query}"</span>}
            {category && <span className="bg-[#E8EEEA] text-[#2F6B4F] px-3 py-1 rounded-lg text-xs font-bold">{category}</span>}
            {city     && <span className="bg-[#E8EEEA] text-[#2F6B4F] px-3 py-1 rounded-lg text-xs font-bold">مدينة</span>}
            {zone     && <span className="bg-[#E8EEEA] text-[#2F6B4F] px-3 py-1 rounded-lg text-xs font-bold">منطقة</span>}
            {meta.total !== undefined && (
              <span className="text-[#6B8578] text-xs">{meta.total} نتيجة</span>
            )}
          </div>
        )}

        <div className="w-full">
          {error ? (
            <div className="public-card text-center py-24 text-red-600 border-red-100 max-w-3xl mx-auto">
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
                    sponsored={Boolean(store.is_featured)}
                  />
                ))}
              </div>

              {meta.last_page > 1 && (
                <div className="mt-16 flex justify-center items-center gap-3 flex-wrap">
                  {meta.current_page > 1 && (
                    <Link
                      href={`/stores?${new URLSearchParams({ ...searchParams as any, page: (meta.current_page - 1).toString() }).toString()}`}
                      className="px-6 py-2.5 bg-white border border-[#E2EAE5] rounded-xl text-[#1A3D32] font-bold hover:bg-[#F7F9F8] transition-colors"
                    >
                      السابق
                    </Link>
                  )}

                  <span className="px-5 py-2.5 bg-[#E8EEEA] text-[#2F6B4F] rounded-xl font-bold">
                    {meta.current_page} من {meta.last_page}
                  </span>

                  {meta.current_page < meta.last_page && (
                    <Link
                      href={`/stores?${new URLSearchParams({ ...searchParams as any, page: (meta.current_page + 1).toString() }).toString()}`}
                      className="px-6 py-2.5 bg-white border border-[#E2EAE5] rounded-xl text-[#1A3D32] font-bold hover:bg-[#F7F9F8] transition-colors"
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
