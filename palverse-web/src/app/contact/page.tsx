import { Mail, Phone, MapPin } from "lucide-react";
import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { sanitizeHtmlContent } from "@/lib/security/sanitize-html";
import { serverFetch } from "@/lib/api/server";

interface ContactCmsPage {
  title_ar?: string;
  excerpt_ar?: string | null;
  content_ar?: string | null;
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

export default async function ContactPage() {
  const cms = await fetchContactCms();

  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh]">
      <BrandSectionHeading
        title={cms?.title_ar || "تواصل معنا"}
        subtitle={
          cms?.excerpt_ar ||
          "نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو اقتراح."
        }
        className="mb-16"
      />

      {cms?.content_ar ? (
        <div className="max-w-6xl mx-auto mb-10">
          <div
            className="bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 text-[#1F2522] dark:text-[#EAF3EC] leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:mr-6 [&_a]:text-[#1E7D4E] [&_a]:underline"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(cms.content_ar) }}
          />
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1F2522] rounded-[2rem] shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 flex flex-col gap-8 h-full">
            <h3 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">معلومات الاتصال</h3>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">رقم الهاتف</h4>
                <p className="text-[#7FA789] dir-ltr text-right">+972 59-388-3932</p>
                <p className="text-[#7FA789] text-sm mt-1">متاحون من 8 صباحاً حتى 5 مساءً</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">البريد الإلكتروني</h4>
                <p className="text-[#7FA789]">info@palverse.ps</p>
                <p className="text-[#7FA789] text-sm mt-1">نرد على رسائلكم خلال 24 ساعة</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center shrink-0 text-[#1E7D4E]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">العنوان</h4>
                <p className="text-[#7FA789]">فلسطين، الخليل</p>
                <p className="text-[#7FA789] text-sm mt-1">دائرة السير</p>
              </div>
            </div>

            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl mt-auto overflow-hidden relative">
              <iframe
                src="https://maps.google.com/maps?q=31.557111,35.096111&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
