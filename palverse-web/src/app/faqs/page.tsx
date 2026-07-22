import type { Metadata } from "next";
import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <BrandSectionHeading
        title="الأسئلة الشائعة"
        className="mb-4 text-center"
      />
      <p className="text-center text-[#7FA789] mb-10">
        إجابات على أكثر الأسئلة شيوعاً حول المنصة
      </p>

      {faqs.length === 0 ? (
        <div className="text-center text-[#7FA789] py-24 border border-dashed border-[#EAF3EC] dark:border-[#0F3D2E] rounded-xl">
          لا توجد أسئلة شائعة متاحة حالياً
        </div>
      ) : (
        <FaqAccordion faqs={faqs} />
      )}
    </div>
  );
}
