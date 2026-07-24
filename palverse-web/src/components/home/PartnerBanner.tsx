import Image from "next/image";
import Link from "next/link";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { serverFetch } from "@/lib/api/server";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { PartnerBannerSlider, type PartnerBannerItem } from "./PartnerBannerSlider";

export async function PartnerBanner() {
  let banners: PartnerBannerItem[] = [];

  try {
    const res = await serverFetch<{ data: PartnerBannerItem[] }>("/advertisements/banners", {
      cache: "no-store",
    });
    banners = Array.isArray(res?.data) ? res.data.filter((b) => b?.image_url || b?.image_path) : [];
  } catch (error) {
    console.error("Failed to fetch banners", error);
  }

  return (
    <section className="public-section bg-white">
      <div className="public-container space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-[#1E7D4E]">مساحة ترويجية</p>
            <h2 className="font-heading text-2xl font-extrabold text-[#0F3D2E] md:text-3xl">
              إعلانات الشركاء
            </h2>
            {banners.length === 0 ? (
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#5F7B6A]">
                لا يوجد بنر ممول نشط الآن. يظهر البنر هنا عندما يكون مفعّلاً وضمن تاريخ الحملة ومعه صورة.
              </p>
            ) : null}
          </div>
        </div>

        {banners.length > 0 ? (
          <PartnerBannerSlider banners={banners} />
        ) : (
          <div className="relative flex min-h-[220px] flex-col overflow-hidden rounded-[1.75rem] md:min-h-[260px] md:flex-row md:items-stretch">
            <div className="absolute inset-0">
              <Image
                src={BRAND_PHOTOS.joinBenefit}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1152px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#0F3D2E]/78" />
            </div>

            <div className="relative z-10 flex w-full flex-col items-center justify-between gap-8 p-8 text-center md:flex-row md:p-12 md:text-start">
              <div className="flex flex-col items-center gap-5 md:flex-row">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2">
                  <BrandIcon />
                </div>
                <div>
                  <h3 className="mb-2 font-heading text-2xl font-bold text-white md:text-3xl">
                    مساحة شريك مميز
                  </h3>
                  <p className="text-base text-[#EAF3EC] md:text-lg">
                    عزّز حضورك التجاري وصل إلى عملائك المستهدفين
                  </p>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-8 py-3 text-base font-bold text-[#0F3D2E] transition-colors hover:bg-[#EAF3EC]"
              >
                تواصل معنا للإعلان
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
