import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { AuthNav } from "@/components/auth/AuthNav";
import { Globe } from "lucide-react";
import { CMS_PAGE_SLUGS } from "@/lib/cms-pages";
export function Header() {
  const dict = getDictionary("ar");

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#1F2522] border-b border-[#EAF3EC] dark:border-[#0F3D2E] shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <BrandLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-[#1E7D4E] font-bold transition-colors">
            الرئيسية
          </Link>
          <Link href="/categories" className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:text-[#1E7D4E] transition-colors">
            الفئات
          </Link>
          <Link href="/stores" className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:text-[#1E7D4E] transition-colors">
            المناطق
          </Link>
          <Link href="/offers" className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:text-[#1E7D4E] transition-colors">
            العروض
          </Link>
          <Link href="/join-us" className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:text-[#1E7D4E] transition-colors flex items-center gap-1">
            أضف نشاطك
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </Link>
          <Link href="/blog" className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:text-[#1E7D4E] transition-colors">
            المدونة
          </Link>
          <Link href={`/pages/${CMS_PAGE_SLUGS.about}`} className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:text-[#1E7D4E] transition-colors">
            من نحن
          </Link>
          <Link href="/contact" className="text-[#0F3D2E] dark:text-[#EAF3EC] font-semibold hover:text-[#1E7D4E] transition-colors">
            تواصل معنا
          </Link>
        </nav>

        {/* Actions / Mobile Menu trigger */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#7FA789] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 hover:text-[#1E7D4E] transition-colors"
            title="اللغة / Language (قريباً)"
          >
            <Globe className="w-5 h-5" />
          </button>
          <AuthNav />
        </div>

      </div>
    </header>
  );
}
