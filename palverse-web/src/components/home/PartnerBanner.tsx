import { getDictionary } from "@/lib/i18n/dictionaries";
import { IslamicPatternBackground } from "@/components/brand/IslamicPatternBackground";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { serverFetch } from "@/lib/api/server";
import Link from "next/link";
import { PartnerBannerSlider } from "./PartnerBannerSlider";

export async function PartnerBanner() {
  const dict = getDictionary("ar");
  
  let banners: any[] = [];
  try {
    const res = await serverFetch<{ data: any[] }>('/advertisements/banners');
    if (res?.data && res.data.length > 0) {
      banners = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch banners", error);
  }

  // If there's active banners
  if (banners.length > 0) {
    return (
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4 max-w-6xl">
          <PartnerBannerSlider banners={banners} />
        </div>
      </section>
    );
  }

  // Fallback / Placeholder when no banner is active
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="relative w-full bg-[#0F3D2E] rounded-[2rem] overflow-hidden shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-center md:text-start gap-8 border border-[#1E7D4E]/20">
          
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <IslamicPatternBackground />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shrink-0">
              <BrandIcon />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-heading">
                مساحة شريك مميز
              </h3>
              <p className="text-[#EAF3EC] text-lg">
                عزز حضورك التجاري ووصل لعملائك المستهدفين
              </p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 mt-6 md:mt-0">
            <Link href="/join" className="inline-block bg-white hover:bg-[#EAF3EC] text-[#0F3D2E] px-8 py-3 rounded-2xl font-bold transition-colors shadow-sm text-lg">
              تواصل معنا للإعلان
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
