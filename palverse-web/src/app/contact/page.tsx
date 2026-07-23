import { CmsPageShell } from "@/components/cms/CmsPageShell";
import { CmsContentBody } from "@/components/cms/CmsContentBody";
import { CmsContactPanel } from "@/components/cms/CmsContactPanel";
import { ContactForm } from "@/components/contact/ContactForm";
import { serverFetch } from "@/lib/api/server";
import type { Metadata } from "next";

interface ContactCmsPage {
  title_ar?: string;
  excerpt_ar?: string | null;
  content_ar?: string | null;
  seo_title_ar?: string | null;
  seo_description_ar?: string | null;
  meta?: Record<string, string | null> | null;
}

async function fetchContactCms(): Promise<ContactCmsPage | null> {
  try {
    const data = await serverFetch<{ data: ContactCmsPage }>("/pages/contact", {
      next: { revalidate: 30 },
    });
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchContactCms();
  return {
    title: cms?.seo_title_ar || cms?.title_ar || "تواصل معنا | Palverse",
    description: cms?.seo_description_ar || cms?.excerpt_ar || undefined,
  };
}

export default async function ContactPage() {
  const cms = await fetchContactCms();

  return (
    <CmsPageShell
      title={cms?.title_ar || "تواصل معنا"}
      subtitle={
        cms?.excerpt_ar ||
        "نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو اقتراح."
      }
      eyebrow={cms?.meta?.hero_eyebrow_ar}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {cms?.content_ar ? (
          <div className="bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 md:p-10">
            <CmsContentBody html={cms.content_ar} />
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-1/3">
            <CmsContactPanel meta={cms?.meta} />
          </div>
          <div className="w-full lg:w-2/3">
            <ContactForm
              whatsappNumber={cms?.meta?.whatsapp_number}
              formTitle={cms?.meta?.form_title_ar}
              submitLabel={cms?.meta?.submit_label_ar}
            />
          </div>
        </div>
      </div>
    </CmsPageShell>
  );
}
