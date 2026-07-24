import Link from "next/link";
import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import { StoreCard } from "@/components/stores/StoreCard";
import { serverFetch } from "@/lib/api/server";
import { Award, Clock, Megaphone } from "lucide-react";

interface HomeStoresListProps {
  title: string;
  subtitle?: string;
  sort?: "newest" | "featured";
  bgClass?: string;
  /** Keep the section visible even when there are no stores (useful for featured ads). */
  showWhenEmpty?: boolean;
}

export async function HomeStoresList({
  title,
  subtitle,
  sort = "newest",
  bgClass = "bg-white dark:bg-[#1F2522]",
  showWhenEmpty = false,
}: HomeStoresListProps) {
  let stores: any[] = [];
  let error = false;

  try {
    const params: Record<string, string | boolean | number> = {
      sort: "newest",
      per_page: 8,
    };

    if (sort === "featured") {
      params.is_featured = true;
    }

    const data = await serverFetch<{ data: any[] }>("/stores", {
      params,
      cache: "no-store",
    });
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    stores = items.slice(0, 4);
  } catch (err) {
    console.error(`Failed to load stores (sort: ${sort}) server-side:`, err);
    error = true;
  }

  if (!showWhenEmpty && (error || stores.length === 0)) {
    return null;
  }

  const Icon = sort === "featured" ? <Award className="w-6 h-6" /> : <Clock className="w-6 h-6" />;

  return (
    <section className={`public-section ${bgClass}`}>
      <div className="public-container">
        <BrandSectionHeading title={title} subtitle={subtitle} icon={Icon} className="mb-8 md:mb-12" />

        {stores.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store.slug || store.public_id}
                name={store.name_ar || store.name_en || ""}
                slug={store.slug}
                publicId={store.public_id}
                categoryName={store.category?.name_ar || store.category?.name_en || ""}
                cityName={
                  store.city?.name_ar ||
                  store.city?.name_en ||
                  store.zone?.city?.name_ar ||
                  store.zone?.city?.name_en ||
                  ""
                }
                coverImage={store.cover?.url}
                logoImage={store.logo?.url}
                averageRating={
                  store.published_reviews_avg_rating
                    ? Number(store.published_reviews_avg_rating)
                    : undefined
                }
                ratingsCount={
                  store.published_reviews_count ? Number(store.published_reviews_count) : undefined
                }
                sponsored={sort === "featured"}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#1E7D4E]/25 bg-white px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3EC] text-[#1E7D4E]">
              <Megaphone className="h-7 w-7" />
            </div>
            <h3 className="mb-2 font-heading text-lg font-bold text-[#0F3D2E]">
              لا توجد إعلانات مميزة نشطة حالياً
            </h3>
            <p className="mb-6 max-w-md text-sm leading-7 text-[#5F7B6A]">
              يظهر المتجر هنا فقط إذا كان إعلان «إبراز المتجر» مفعّلاً، وتاريخ اليوم ضمن فترة الحملة،
              والمتجر معتمداً ونشطاً باشتراك ساري.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[#1E7D4E] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0F3D2E]"
            >
              تواصل للإعلان
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
