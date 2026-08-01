import type { ReactNode } from "react";
import { PublicPageHero } from "@/components/public/PublicPageHero";

interface CmsPageShellProps {
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  children: ReactNode;
  variant?: "about" | "contact" | "default";
}

export function CmsPageShell({
  title,
  subtitle,
  children,
}: CmsPageShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <PublicPageHero title={title} subtitle={subtitle || undefined} size="page" />
      <section className="public-container pb-20 pt-8 md:pt-10">{children}</section>
    </div>
  );
}
