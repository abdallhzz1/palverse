import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CmsPageShell } from "@/components/cms/CmsPageShell";
import { CmsContentBody } from "@/components/cms/CmsContentBody";
import { CmsContactPanel } from "@/components/cms/CmsContactPanel";
import { ContactForm } from "@/components/contact/ContactForm";
import { serverFetch } from "@/lib/api/server";

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

  const isContact = page.page_type === "contact" || page.slug === "contact" || page.slug === "contact-us";

  return (
    <CmsPageShell
      title={page.title_ar}
      subtitle={page.excerpt_ar}
      eyebrow={page.meta?.hero_eyebrow_ar}
    >
      {isContact ? (
        <div className="max-w-6xl mx-auto space-y-8">
          {page.content_ar ? (
            <div className="bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 md:p-10">
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
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 md:p-12 min-h-[320px]">
          <CmsContentBody html={page.content_ar} />
          {page.updated_at ? (
            <p className="text-xs text-[#7FA789] mt-10 text-center">
              آخر تحديث:{" "}
              {new Date(page.updated_at).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          ) : null}
        </div>
      )}
    </CmsPageShell>
  );
}
