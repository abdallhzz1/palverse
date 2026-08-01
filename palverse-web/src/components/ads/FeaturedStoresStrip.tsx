import Link from "next/link";
import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import { StoreCard } from "@/components/stores/StoreCard";
import { StoreCardsRow, StoreCardsRowItem } from "@/components/stores/StoreCardsRow";
import { serverFetch } from "@/lib/api/server";
import { Award, Megaphone } from "lucide-react";

type FeaturedStoresStripProps = {
  title?: string;
  subtitle?: string;
  limit?: number;
  bgClass?: string;
  /** Keep empty placeholder (homepage). Listing pages should hide when empty. */
  showWhenEmpty?: boolean;
  className?: string;
  /** Skip outer section padding when nested in an existing container. */
  embedded?: boolean;
};

export async function FeaturedStoresStrip({
  title = "محلات مميزة",
  subtitle = "محلات مُبرَزة عبر حملات إعلانية ممولة نشطة",
  limit = 4,
  bgClass = "bg-[#F7F9F8]",
  showWhenEmpty = false,
  className = "",
  embedded = false,
}: FeaturedStoresStripProps) {
  let stores: any[] = [];

  try {
    const data = await serverFetch<{ data: any[] }>("/stores", {
      params: {
        is_featured: true,
        sort: "newest",
        per_page: Math.max(limit, 8),
      },
      cache: "no-store",
    });
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    stores = items.slice(0, limit);
  } catch (err) {
    console.error("Failed to load featured stores:", err);
  }

  if (!showWhenEmpty && stores.length === 0) {
    return null;
  }

  const body = (
    <>
      <BrandSectionHeading
        title={title}
        subtitle={subtitle}
        icon={<Award className="w-6 h-6" />}
        className="mb-6 md:mb-8"
      />

      {stores.length > 0 ? (
        <StoreCardsRow>
          {stores.map((store) => (
            <StoreCardsRowItem key={store.slug || store.public_id}>
              <StoreCard
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
                averageRating={
                  store.published_reviews_avg_rating
                    ? Number(store.published_reviews_avg_rating)
                    : undefined
                }
                ratingsCount={
                  store.published_reviews_count ? Number(store.published_reviews_count) : undefined
                }
                sponsored
              />
            </StoreCardsRowItem>
          ))}
        </StoreCardsRow>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2EAE5] bg-white px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] text-[#2F6B4F]">
            <Megaphone className="h-7 w-7" />
          </div>
          <h3 className="mb-2 font-heading text-lg font-bold text-[#1A3D32]">
            لا توجد إعلانات مميزة نشطة حالياً
          </h3>
          <p className="mb-6 max-w-md text-sm leading-7 text-[#6B8578]">
            يظهر المتجر هنا فقط إذا كان إعلان «إبراز المتجر» مفعّلاً، وتاريخ اليوم ضمن فترة الحملة،
            والمتجر معتمداً ونشطاً باشتراك ساري.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-[#2F6B4F] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1A3D32]"
          >
            تواصل للإعلان
          </Link>
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className={className}>{body}</div>;
  }

  return (
    <section className={`public-section ${bgClass} ${className}`}>
      <div className="public-container">{body}</div>
    </section>
  );
}
