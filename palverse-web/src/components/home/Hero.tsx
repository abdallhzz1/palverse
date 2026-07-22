import { IslamicPatternBackground } from "@/components/brand/IslamicPatternBackground";
import { SearchBar } from "@/components/search/SearchBar";
import { serverFetch } from "@/lib/api/server";
import Image from "next/image";
import { Suspense } from "react";

export async function Hero() {
  let cities: { public_id: string; name_ar: string; name_en: string }[] = [];

  try {
    const data = await serverFetch<{ data: { categories: unknown[]; cities: typeof cities } }>(
      "/bootstrap"
    );
    cities = data?.data?.cities || [];
  } catch (err) {
    console.error("Failed to load bootstrap data for Hero:", err);
  }

  return (
    <section className="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden bg-[#F5F7F6] pb-32 pt-16 md:pb-48 md:pt-24">
      <div className="pointer-events-none absolute inset-y-0 end-0 z-0 w-full md:w-[65%] lg:w-[55%]">
        <Image
          src="/brand/illustrations/al-aqsa-line-art.png"
          alt="Al-Aqsa Mosque Background"
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover object-bottom opacity-25 mix-blend-multiply md:opacity-30"
          priority
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07]">
        <IslamicPatternBackground />
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center">
        <div className="flex w-full flex-col items-center gap-4 md:gap-6">
          <h1 className="text-4xl font-extrabold leading-tight text-[#0F3D2E] md:text-5xl lg:text-6xl">
            اكتشف أفضل الأعمال في فلسطين
          </h1>
          <p className="max-w-2xl text-lg font-bold text-[#7FA789] md:text-xl">
            من مطاعم ومقاهي، خدمات، محلات ومتاجر في جميع المدن الفلسطينية
          </p>

          <div className="mt-4 w-full max-w-2xl md:mt-8">
            <Suspense
              fallback={
                <div className="h-16 w-full animate-pulse rounded-full bg-white/50" />
              }
            >
              <SearchBar cities={cities} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
