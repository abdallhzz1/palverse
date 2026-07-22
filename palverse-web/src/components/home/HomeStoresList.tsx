import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import { StoreCard } from "@/components/stores/StoreCard";
import { serverFetch } from "@/lib/api/server";
import { Award, Clock } from "lucide-react";

interface HomeStoresListProps {
  title: string;
  subtitle?: string;
  sort?: "newest" | "featured";
  bgClass?: string;
}

export async function HomeStoresList({ title, subtitle, sort = "newest", bgClass = "bg-white dark:bg-[#1F2522]" }: HomeStoresListProps) {
  let stores: any[] = [];
  let error = false;

  try {
    const params: any = { sort: 'relevance' };
    
    if (sort === 'featured') {
      params.is_featured = true;
    } else if (sort === 'newest') {
      params.sort = 'newest';
    }

    const data = await serverFetch<{ data: any[] }>('/stores', { params, cache: 'no-store' });
    const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    stores = items.slice(0, 4); // top 4 for home page row
  } catch (err) {
    console.error(`Failed to load stores (sort: ${sort}) server-side:`, err);
    error = true;
  }

  if (error || stores.length === 0) {
    return null;
  }

  const Icon = sort === "featured" ? <Award className="w-6 h-6" /> : <Clock className="w-6 h-6" />;

  return (
    <section className={`py-8 md:py-16 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <BrandSectionHeading title={title} subtitle={subtitle} icon={Icon} className="mb-8 md:mb-12" />
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {stores.map((store, i) => (
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
      </div>
    </section>
  );
}
