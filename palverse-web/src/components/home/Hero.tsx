import { PublicPageHero } from "@/components/public/PublicPageHero";
import { SearchBar } from "@/components/search/SearchBar";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { serverFetch } from "@/lib/api/server";
import { Suspense } from "react";

export async function Hero() {
  let cities: { public_id: string; name_ar: string; name_en: string }[] = [];
  let categories: { slug: string; name_ar: string; name_en: string }[] = [];

  try {
    const data = await serverFetch<{ data: { categories: typeof categories; cities: typeof cities } }>(
      "/bootstrap"
    );
    cities = data?.data?.cities || [];
    categories = data?.data?.categories || [];
  } catch (err) {
    console.error("Failed to load bootstrap data for Hero:", err);
  }

  return (
    <PublicPageHero
      size="home"
      priority
      imageSrc={BRAND_PHOTOS.hero}
      imageAlt="أجواء مقاهي وأسواق فلسطينية معاصرة"
      title="عن ماذا تبحث؟"
      subtitle="مطاعم، مقاهي، خدمات ومحلات — ابحث في مدينتك وابدأ الاستكشاف."
    >
      <Suspense fallback={<div className="h-16 w-full animate-pulse rounded-full bg-white/20" />}>
        <SearchBar cities={cities} categories={categories} variant="onHero" />
      </Suspense>
    </PublicPageHero>
  );
}
