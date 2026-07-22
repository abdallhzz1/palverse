import { Hero } from "@/components/home/Hero";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeStoresList } from "@/components/home/HomeStoresList";
import { PartnerBanner } from "@/components/home/PartnerBanner";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function Home() {
  const dict = getDictionary("ar");

  return (
    <div className="flex flex-col w-full bg-[#F5F7F6]">
      <Hero />
      <HomeCategories />
      
      <PartnerBanner />

      {/* Featured Stores */}
      <HomeStoresList 
        title={dict.home.featuredStores} 
        sort="featured" 
        bgClass="bg-transparent"
      />
      
      {/* Latest Stores */}
      <HomeStoresList 
        title={dict.home.latestStores} 
        sort="newest" 
        bgClass="bg-transparent"
      />
    </div>
  );
}
