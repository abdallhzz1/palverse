"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  public_id: string;
  question_ar: string;
  question_en: string | null;
  answer_ar: string;
  answer_en: string | null;
  category: string | null;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

function FaqAccordionItem({ faq }: { faq: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#EAF3EC] dark:border-[#0F3D2E] rounded-xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-5 text-right bg-white dark:bg-[#1F2522] hover:bg-[#F4FAF6] dark:hover:bg-[#0F3D2E]/20 transition-colors duration-150"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC] leading-relaxed">
          {faq.question_ar}
        </span>
        <ChevronDown
          className={`shrink-0 h-5 w-5 text-[#1E7D4E] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 bg-[#F4FAF6] dark:bg-[#0F3D2E]/10 border-t border-[#EAF3EC] dark:border-[#0F3D2E]">
          <p className="text-[#1F2522] dark:text-[#C8DEC9] leading-relaxed text-sm">
            {faq.answer_ar}
          </p>
        </div>
      )}
    </div>
  );
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  // Group by category
  const grouped: Record<string, FaqItem[]> = {};
  for (const faq of faqs) {
    const cat = faq.category || "عام";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(faq);
  }

  const categories = Object.keys(grouped);
  const hasMultipleCategories = categories.length > 1;

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          {hasMultipleCategories && (
            <h2 className="text-sm font-bold text-[#1E7D4E] uppercase tracking-widest mb-3 px-1">
              {category}
            </h2>
          )}
          <div className="space-y-3">
            {grouped[category].map((faq, index) => (
              <FaqAccordionItem
                key={faq.public_id || `${category}-${index}`}
                faq={faq}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
