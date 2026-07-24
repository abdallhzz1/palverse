"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CMS_PAGE_SLUGS } from "@/lib/cms-pages";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "الرئيسية", exact: true },
  { href: "/categories", label: "الفئات" },
  { href: "/stores", label: "المحلات" },
  { href: "/offers", label: "العروض" },
  { href: "/join-us", label: "أضف نشاطك" },
  { href: "/blog", label: "المدونة" },
  { href: `/pages/${CMS_PAGE_SLUGS.about}`, label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
] as const;

export function PublicNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
      {NAV.map((item) => {
        const exact = "exact" in item && item.exact;
        const active = exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-semibold transition-colors xl:px-3.5",
              active
                ? "bg-[#EAF3EC] text-[#1E7D4E]"
                : "text-[#0F3D2E]/80 hover:bg-[#F5F7F6] hover:text-[#1E7D4E]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
