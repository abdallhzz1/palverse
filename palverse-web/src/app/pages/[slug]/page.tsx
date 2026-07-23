import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import { sanitizeHtmlContent } from "@/lib/security/sanitize-html";

interface StaticPageData {
  slug: string;
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
}

async function fetchPage(slug: string): Promise<StaticPageData | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${apiBaseUrl}/pages/${slug}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <BrandSectionHeading title={page.title_ar} className="mb-8" />

      <div className="bg-white dark:bg-[#1F2522] rounded-xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 min-h-[400px]">
        {page.content_ar ? (
          <div
            className="text-[#1F2522] dark:text-[#EAF3EC] leading-relaxed text-base [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-[#0F3D2E] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-[#0F3D2E] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:mr-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:mr-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-[#1E7D4E] [&_a]:underline [&_strong]:font-bold [&_strong]:text-[#0F3D2E] dark:[&_strong]:text-[#7FA789]"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(page.content_ar) }}
          />
        ) : (
          <p className="text-[#7FA789] text-center mt-12">
            لا يوجد محتوى لهذه الصفحة بعد.
          </p>
        )}
      </div>

      {page.updated_at && (
        <p className="text-xs text-[#7FA789] mt-4 text-center">
          آخر تحديث:{" "}
          {new Date(page.updated_at).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
