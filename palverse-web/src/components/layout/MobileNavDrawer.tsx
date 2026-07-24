"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { isMerchantRole } from "@/lib/auth/roles";
import { usePublicAuth } from "@/contexts/AuthContext";
import { CMS_PAGE_SLUGS, cmsPageHref } from "@/lib/cms-pages";
import { cn } from "@/lib/utils";

const EXPLORE_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/categories", label: "الفئات" },
  { href: "/stores", label: "المحلات" },
  { href: "/offers", label: "العروض" },
  { href: "/join-us", label: "أضف نشاطك" },
  { href: "/blog", label: "المدونة" },
] as const;

const INFO_LINKS = [
  { href: cmsPageHref(CMS_PAGE_SLUGS.about), label: "من نحن" },
  { href: cmsPageHref(CMS_PAGE_SLUGS.privacy), label: "الخصوصية" },
  { href: cmsPageHref(CMS_PAGE_SLUGS.terms), label: "الشروط" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/faqs", label: "الأسئلة الشائعة" },
  { href: "/login", label: "بوابة الشركاء" },
] as const;

function MerchantMobileLink({ onClose }: { onClose: () => void }) {
  const { user, isAuthenticated } = usePublicAuth();

  if (!isAuthenticated || !user) return null;
  if (!isMerchantRole(user.roles)) return null;

  return (
    <div className="mt-auto border-t border-[#EAF3EC] p-4">
      <Link
        onClick={onClose}
        href="/merchant"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D2E] py-3 font-bold text-white transition-colors hover:bg-[#1E7D4E]"
      >
        لوحة التاجر
      </Link>
    </div>
  );
}

function NavSection({
  title,
  links,
  onClose,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
  onClose: () => void;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-4 text-xs font-bold tracking-wide text-[#7FA789]">{title}</p>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="rounded-xl px-4 py-3 font-semibold text-[#0F3D2E] transition-colors hover:bg-[#EAF3EC] hover:text-[#1E7D4E]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function MobileNavDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const drawer = (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[200] bg-[#0F3D2E]/45 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden={!isOpen}
      />

      <aside
        className={cn(
          "fixed inset-y-0 end-0 z-[210] flex w-[min(20rem,88vw)] flex-col bg-white shadow-[-12px_0_40px_-12px_rgba(15,61,46,0.35)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="القائمة الرئيسية"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-[#EAF3EC] px-4 py-4">
          <span className="font-heading text-lg font-bold text-[#0F3D2E]">القائمة الرئيسية</span>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-[#7FA789] transition-colors hover:bg-[#EAF3EC] hover:text-[#0F3D2E]"
            aria-label="إغلاق القائمة"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <NavSection title="استكشف" links={EXPLORE_LINKS} onClose={close} />
          <NavSection title="معلومات" links={INFO_LINKS} onClose={close} />
          <MerchantMobileLink onClose={close} />
        </div>
      </aside>
    </>
  );

  return (
    <div className="flex items-center gap-1 lg:hidden">
      <Link
        href="/stores"
        className="rounded-full p-2 text-[#0F3D2E] transition-colors hover:bg-[#EAF3EC]"
        aria-label="بحث"
      >
        <Search className="h-6 w-6" />
      </Link>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full p-2 text-[#0F3D2E] transition-colors hover:bg-[#EAF3EC]"
        aria-label="فتح القائمة"
        aria-expanded={isOpen}
      >
        <Menu className="h-6 w-6" />
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
