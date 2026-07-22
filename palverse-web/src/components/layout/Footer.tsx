import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AqsaLineArt } from "@/components/brand/AqsaLineArt";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { serverFetch } from "@/lib/api/server";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export async function Footer() {
  const dict = getDictionary("ar");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0F3D2E] text-white pt-6 pb-28 md:py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-2">
          <BrandLogo className="h-6 md:h-8 w-auto brightness-0 invert" />
        </div>

        {/* Center Slogan */}
        <div className="flex items-center gap-4 text-[#7FA789] text-sm md:text-base font-bold">
          <span className="hidden md:inline">🌿</span>
          <p>كل فلسطين في دليل واحد</p>
          <span className="hidden md:inline">🌿</span>
        </div>

        {/* Links and Socials */}
        <div className="flex items-center gap-4 text-sm text-[#EAF3EC]">
          <Link href="/login" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            بوابة الشركاء
          </Link>
          <Link href="/faqs" className="hover:text-white transition-colors border-l border-[#1E7D4E] pl-4">
            الأسئلة الشائعة
          </Link>
          <a href="https://www.palverse.ps" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            www.palverse.ps
          </a>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
