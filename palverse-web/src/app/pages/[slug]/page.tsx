import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CmsPageShell } from "@/components/cms/CmsPageShell";
import { CmsContentBody } from "@/components/cms/CmsContentBody";
import { CmsContactPanel } from "@/components/cms/CmsContactPanel";
import { ContactForm } from "@/components/contact/ContactForm";
import { serverFetch } from "@/lib/api/server";
import { CMS_PAGE_SLUGS } from "@/lib/cms-pages";

interface StaticPageData {
  slug: string;
  page_type?: "content" | "contact";
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  published_at: string;
  updated_at: string;
  meta?: Record<string, string | null> | null;
}

async function fetchPage(slug: string): Promise<StaticPageData | null> {
  try {
    const json = await serverFetch<{ data: StaticPageData }>(`/pages/${slug}`, {
      next: { revalidate: 30 },
    });
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) {
    return {
      title: "الصفحة غير موجودة | Palverse",
    };
  }

  return {
    title: page.seo_title_ar || page.title_ar,
    description: page.seo_description_ar || page.excerpt_ar || undefined,
    openGraph: {
      title: page.seo_title_ar || page.title_ar,
      description: page.seo_description_ar || page.excerpt_ar || undefined,
    },
  };
}

export default async function StaticPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) {
    notFound();
  }

  const isContact =
    page.page_type === "contact" || page.slug === CMS_PAGE_SLUGS.contact || page.slug === "contact-us";
  const isAbout = page.slug === CMS_PAGE_SLUGS.about || page.slug === "about-us";
  const variant = isContact ? "contact" : isAbout ? "about" : "default";

  return (
    <CmsPageShell
      title={page.title_ar}
      subtitle={page.excerpt_ar}
      eyebrow={page.meta?.hero_eyebrow_ar}
      variant={variant}
    >
      {isContact ? (
        <div className="max-w-6xl mx-auto space-y-6">
          {page.content_ar ? (
            <div className="bg-white rounded-[2rem] border border-[#EAF3EC] shadow-[0_1px_3px_rgba(15,61,46,0.04)] p-8 md:p-10">
              <CmsContentBody html={page.content_ar} />
            </div>
          ) : null}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="w-full lg:w-1/3">
              <CmsContactPanel meta={page.meta} />
            </div>
            <div className="w-full lg:w-2/3">
              <ContactForm
                whatsappNumber={page.meta?.whatsapp_number}
                formTitle={page.meta?.form_title_ar}
                submitLabel={page.meta?.submit_label_ar}
              />
            </div>
          </div>
        </div>
      ) : (
        <article className="mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-[#EAF3EC] bg-white shadow-[0_1px_3px_rgba(15,61,46,0.04)]">
          <div className="border-b border-[#EAF3EC] bg-gradient-to-l from-[#EAF3EC]/80 to-white px-6 py-5 md:px-10 md:py-6">
            <p className="text-sm font-bold text-[#1E7D4E]">محتوى الصفحة</p>
            <p className="mt-1 text-sm text-[#7FA789]">اقرأ التفاصيل التالية بوضوح وراحة</p>
          </div>
          <div className="px-6 py-8 md:px-12 md:py-12">
            <CmsContentBody html={page.content_ar} />
          </div>
          {page.updated_at ? (
            <p className="border-t border-[#EAF3EC] px-6 py-5 text-center text-xs text-[#7FA789] md:px-12">
              آخر تحديث:{" "}
              {new Date(page.updated_at).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          ) : null}
        </article>
      )}
    </CmsPageShell>
  );
}
