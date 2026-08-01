import { Hero } from "@/components/home/Hero";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeStoresList } from "@/components/home/HomeStoresList";
import { PartnerBanner } from "@/components/home/PartnerBanner";
import { AdBannerSlot } from "@/components/ads/AdBannerSlot";
import { FeaturedStoresStrip } from "@/components/ads/FeaturedStoresStrip";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default function Home() {
  const dict = getDictionary("ar");

  return (
    <div className="flex w-full flex-col bg-[#F5F7F6]">
      <Hero />
      {/* 1) Banner right under search — highest visibility */}
      <PartnerBanner />
      <HomeCategories />
      {/* 2) Featured/sponsored store cards */}
      <FeaturedStoresStrip
        title={dict.home.featuredStores}
        subtitle="محلات مُبرَزة عبر حملات إعلانية ممولة نشطة"
        showWhenEmpty
      />
      {/* 3) Mid-page second banner impression */}
      <AdBannerSlot
        variant="inline"
        title="عروض الشركاء"
        className="bg-white"
      />
      <HomeStoresList
        title={dict.home.latestStores}
        subtitle="أحدث الانضمامات إلى الدليل"
        sort="newest"
        bgClass="bg-white"
      />
    </div>
  );
}
