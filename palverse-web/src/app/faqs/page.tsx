import type { Metadata } from "next";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
import { FaqAccordion } from "@/components/faqs/FaqAccordion";

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
    <div className="min-h-screen bg-[#F7F9F8]">
      <PublicPageHero
        title="الأسئلة الشائعة"
        subtitle="إجابات واضحة على أكثر ما يسأل عنه زوار وتجار بالفيرس."
        size="page"
      />

      <section className="public-container max-w-3xl pb-20 pt-8">
        {faqs.length === 0 ? (
          <EmptyStateArt
            title="لا توجد أسئلة شائعة حالياً"
            description="سنضيف إجابات مفيدة قريباً. يمكنك التواصل معنا لأي استفسار."
            actionHref="/contact"
            actionLabel="تواصل معنا"
          />
        ) : (
          <div className="rounded-xl border border-[#E2EAE5] bg-white p-4 md:p-6">
            <FaqAccordion faqs={faqs} />
          </div>
        )}
      </section>
    </div>
  );
}
