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
    <footer className="bg-[#0F3D2E] text-white pt-6 pb-28 md:py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrandLogo className="h-6 md:h-8 w-auto brightness-0 invert" />
        </div>

        <div className="flex items-center gap-4 text-[#7FA789] text-sm md:text-base font-bold">
          <span className="hidden md:inline">🌿</span>
          <p>كل فلسطين في دليل واحد</p>
          <span className="hidden md:inline">🌿</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#EAF3EC]">
          {cmsLinks.map((page) => (
            <Link
              key={page.slug}
              href={cmsPageHref(page.slug)}
              className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4"
            >
              {page.title_ar}
            </Link>
          ))}
          <Link href="/faqs" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            الأسئلة الشائعة
          </Link>
          <Link href="/login" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            بوابة الشركاء
          </Link>
          <a href="https://www.palverse.ps" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            www.palverse.ps
          </a>
        </div>
      </div>
    </footer>
  );
}
