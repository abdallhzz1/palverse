import type { ReactNode } from "react";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

interface CmsPageShellProps {
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  children: ReactNode;
  /** about | contact | default */
  variant?: "about" | "contact" | "default";
}

export function CmsPageShell({
  title,
  subtitle,
  children,
  variant = "default",
}: CmsPageShellProps) {
  const imageSrc =
    variant === "contact"
      ? BRAND_PHOTOS.contact
      : variant === "about"
        ? BRAND_PHOTOS.about
        : BRAND_PHOTOS.about;

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <PublicPageHero
        title={title}
        subtitle={subtitle || undefined}
        imageSrc={imageSrc}
        imageAlt=""
        size="page"
        priority
      />
      <section className="public-container relative z-20 -mt-8 pb-20 md:-mt-10">{children}</section>
    </div>
  );
}
