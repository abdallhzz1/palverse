import { Hero } from "@/components/home/Hero";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeStoresList } from "@/components/home/HomeStoresList";
import { PartnerBanner } from "@/components/home/PartnerBanner";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default function Home() {
  const dict = getDictionary("ar");

  return (
    <div className="flex w-full flex-col bg-[#F5F7F6]">
      <Hero />
      {/* Paid ads stay above browse sections so campaigns are visible without scrolling past categories */}
      <PartnerBanner />
      <HomeCategories />
      <HomeStoresList
        title={dict.home.featuredStores}
        subtitle="محلات مُبرَزة عبر حملات إعلانية ممولة نشطة"
        sort="featured"
        bgClass="bg-[#F5F7F6]"
        showWhenEmpty
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
