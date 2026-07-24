import type { Metadata } from "next";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
import { FaqAccordion } from "@/components/faqs/FaqAccordion";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | Palverse",
  description: "إجابات على أكثر الأسئلة شيوعاً حول منصة بالفيرس",
};

interface FaqItem {
  public_id: string;
  question_ar: string;
  question_en: string | null;
  answer_ar: string;
  answer_en: string | null;
  category: string | null;
}

async function fetchFaqs(): Promise<FaqItem[]> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${apiBaseUrl}/faqs`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export default async function FaqsPage() {
  const faqs = await fetchFaqs();

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <PublicPageHero
        title="الأسئلة الشائعة"
        subtitle="إجابات واضحة على أكثر ما يسأل عنه زوار وتجار بالفيرس."
        imageSrc={BRAND_PHOTOS.faq}
        imageAlt=""
        size="page"
        priority
      />

      <section className="public-container relative z-20 -mt-8 max-w-3xl pb-20 md:-mt-10">
        {faqs.length === 0 ? (
          <EmptyStateArt
            title="لا توجد أسئلة شائعة حالياً"
            description="سنضيف إجابات مفيدة قريباً. يمكنك التواصل معنا لأي استفسار."
            actionHref="/contact"
            actionLabel="تواصل معنا"
          />
        ) : (
          <div className="rounded-[1.75rem] border border-[#EAF3EC] bg-white p-4 shadow-[0_1px_3px_rgba(15,61,46,0.04)] md:p-6">
            <FaqAccordion faqs={faqs} />
          </div>
        )}
      </section>
    </div>
  );
}
