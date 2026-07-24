import { Hero } from "@/components/home/Hero";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeStoresList } from "@/components/home/HomeStoresList";
import { PartnerBanner } from "@/components/home/PartnerBanner";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function Home() {
  const dict = getDictionary("ar");

  return (
    <div className="flex w-full flex-col bg-[#F5F7F6]">
      <Hero />
      <HomeCategories />
      <HomeStoresList
        title={dict.home.featuredStores}
        subtitle="أعمال مختارة بعناية لتبدأ منها"
        sort="featured"
        bgClass="bg-white"
      />
      <HomeStoresList
        title={dict.home.latestStores}
        subtitle="أحدث الانضمامات إلى الدليل"
        sort="newest"
        bgClass="bg-[#F5F7F6]"
      />
      <PartnerBanner />
    </div>
  );
}
