import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export async function Footer() {
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
          <Link href="/pages/about-us" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            من نحن
          </Link>
          <Link href="/pages/privacy-policy" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            الخصوصية
          </Link>
          <Link href="/pages/terms-and-conditions" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            الشروط
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            تواصل
          </Link>
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
