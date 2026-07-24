"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Edit, Clock, Link as LinkIcon, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreDetailNavProps {
  publicId: string;
}

export function StoreDetailNav({ publicId }: StoreDetailNavProps) {
  const pathname = usePathname();
  const base = `/stores/${publicId}`;

  const tabs = [
    { href: base, label: "نظرة عامة", icon: Store, exact: true },
    { href: `${base}/edit`, label: "تعديل", icon: Edit, exact: true },
    { href: `${base}/hours`, label: "ساعات العمل", icon: Clock, exact: false },
    { href: `${base}/social-links`, label: "روابط التواصل", icon: LinkIcon, exact: false },
    { href: `${base}/offers`, label: "العروض", icon: Tag, exact: false },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border dark:border-slate-800">
      {tabs.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px",
              isActive
                ? "border-[#1E7D4E] text-[#1E7D4E] dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
