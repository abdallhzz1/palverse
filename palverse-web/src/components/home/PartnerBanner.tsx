import Image from "next/image";
import Link from "next/link";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { serverFetch } from "@/lib/api/server";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { PartnerBannerSlider } from "./PartnerBannerSlider";

export async function PartnerBanner() {
  let banners: unknown[] = [];
  try {
    const res = await serverFetch<{ data: unknown[] }>("/advertisements/banners");
    if (res?.data && res.data.length > 0) {
      banners = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch banners", error);
  }

  if (banners.length > 0) {
    return (
      <section className="public-section bg-transparent">
        <div className="public-container">
          <PartnerBannerSlider banners={banners as never[]} />
        </div>
      </section>
    );
  }

  return (
    <section className="public-section bg-white">
      <div className="public-container">
        <div className="relative flex min-h-[240px] flex-col overflow-hidden rounded-[1.75rem] md:flex-row md:items-stretch">
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
      </div>
    </section>
  );
}
