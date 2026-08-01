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
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors xl:px-3.5",
              active
                ? "bg-[#E8EEEA] text-[#2F6B4F]"
                : "text-[#1A3D32]/80 hover:bg-[#F7F9F8] hover:text-[#2F6B4F]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
