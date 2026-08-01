"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Plus, LayoutGrid, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { CMS_PAGE_SLUGS, cmsPageHref } from "@/lib/cms-pages";

export function BottomNav() {
  const pathname = usePathname();
  const aboutHref = cmsPageHref(CMS_PAGE_SLUGS.about);

  const navItems = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "المحلات", href: "/stores", icon: Store },
    { isAction: true, href: "/join-us", icon: Plus, name: "أضف" },
    { name: "الفئات", href: "/categories", icon: LayoutGrid },
    { name: "من نحن", href: aboutHref, icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2EAE5] bg-white/95 pb-safe backdrop-blur-md md:hidden">
      <div className="relative flex h-[4.25rem] items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key="action"
                href={item.href}
                className="-mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2F6B4F] text-white transition-colors hover:bg-[#1A3D32]"
                aria-label={item.name}
              >
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex w-16 flex-col items-center gap-1 py-2"
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-[#2F6B4F]" : "text-[#6B8578]"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px]",
                  isActive ? "font-extrabold text-[#2F6B4F]" : "font-semibold text-[#6B8578]"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
