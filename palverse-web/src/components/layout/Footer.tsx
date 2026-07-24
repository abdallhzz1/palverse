import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { serverFetch } from "@/lib/api/server";
import { CMS_PAGE_SLUGS, cmsPageHref, type CmsPageSummary } from "@/lib/cms-pages";

const FALLBACK_LINKS: Array<{ slug: string; title_ar: string }> = [
  { slug: CMS_PAGE_SLUGS.about, title_ar: "من نحن" },
  { slug: CMS_PAGE_SLUGS.privacy, title_ar: "الخصوصية" },
  { slug: CMS_PAGE_SLUGS.terms, title_ar: "الشروط" },
  { slug: CMS_PAGE_SLUGS.contact, title_ar: "تواصل" },
];

async function fetchPublishedPages(): Promise<CmsPageSummary[]> {
  try {
    const data = await serverFetch<{ data: CmsPageSummary[] }>("/pages", {
      next: { revalidate: 30 },
    });
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

export async function Footer() {
  const pages = await fetchPublishedPages();
  const preferredOrder = [
    CMS_PAGE_SLUGS.about,
    CMS_PAGE_SLUGS.privacy,
    CMS_PAGE_SLUGS.terms,
    CMS_PAGE_SLUGS.contact,
  ];

  const cmsLinks =
    pages.length > 0
      ? [...pages].sort((a, b) => {
          const ai = preferredOrder.indexOf(a.slug as (typeof preferredOrder)[number]);
          const bi = preferredOrder.indexOf(b.slug as (typeof preferredOrder)[number]);
          const aRank = ai === -1 ? 100 : ai;
          const bRank = bi === -1 ? 100 : bi;
          return aRank - bRank;
        })
      : FALLBACK_LINKS;

  return (
    <footer className="mt-auto border-t border-[#1E7D4E]/30 bg-[#0F3D2E] pb-28 pt-12 text-white md:pb-12 md:pt-14">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <BrandLogo className="h-8 w-auto brightness-0 invert" />
          <p className="max-w-sm text-sm font-medium leading-relaxed text-[#EAF3EC]/85">
            دليل الأعمال الفلسطيني — اكتشف المطاعم، المقاهي، والخدمات والمحلات في مدينتك.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-sm font-bold tracking-wide text-[#7FA789]">استكشف</h3>
          <div className="flex flex-col gap-2.5 text-sm font-semibold text-[#EAF3EC]">
            <Link href="/stores" className="transition-colors hover:text-white">المحلات</Link>
            <Link href="/categories" className="transition-colors hover:text-white">الفئات</Link>
            <Link href="/offers" className="transition-colors hover:text-white">العروض</Link>
            <Link href="/join-us" className="transition-colors hover:text-white">أضف نشاطك</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-sm font-bold tracking-wide text-[#7FA789]">المزيد</h3>
          <div className="flex flex-col gap-2.5 text-sm font-semibold text-[#EAF3EC]">
            {cmsLinks.map((page) => (
              <Link key={page.slug} href={cmsPageHref(page.slug)} className="transition-colors hover:text-white">
                {page.title_ar}
              </Link>
            ))}
            <Link href="/faqs" className="transition-colors hover:text-white">الأسئلة الشائعة</Link>
            <Link href="/login" className="transition-colors hover:text-white">بوابة الشركاء</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-6xl items-center justify-between border-t border-white/10 px-4 pt-6 text-xs font-medium text-[#7FA789]">
        <span>© {new Date().getFullYear()} Palverse</span>
        <a href="https://www.palverse.ps" target="_blank" rel="noreferrer" className="hover:text-white">
          www.palverse.ps
        </a>
      </div>
    </footer>
  );
}
