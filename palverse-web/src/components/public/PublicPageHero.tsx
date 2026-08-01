import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PublicPageHeroProps {
  title: string;
  subtitle?: string;
  /** @deprecated Ignored — visitor pages no longer use photographic heroes. */
  imageSrc?: string;
  imageAlt?: string;
  children?: ReactNode;
  size?: "home" | "page";
  align?: "center" | "start";
  className?: string;
  priority?: boolean;
  /** Optional label above the title. "بال فيرس" is never shown. */
  eyebrow?: string | null;
}

/**
 * Quiet Olive text header — search-first / no full-bleed photography.
 */
export function PublicPageHero({
  title,
  subtitle,
  children,
  size = "page",
  align = "center",
  className,
  eyebrow,
}: PublicPageHeroProps) {
  const isHome = size === "home";
  const resolvedEyebrow =
    eyebrow && eyebrow.trim() && eyebrow.trim() !== "بال فيرس" ? eyebrow.trim() : null;

  return (
    <section
      className={cn(
        "w-full border-b border-[#E2EAE5]",
        isHome ? "relative z-30 bg-[#F0F4F1]" : "bg-white",
        className
      )}
    >
      <div
        className={cn(
          "public-container flex flex-col",
          isHome ? "py-10 md:py-14" : "py-8 md:py-10",
          align === "center" ? "items-center text-center" : "items-start text-start"
        )}
      >
        <div
          className={cn(
            "animate-fade-up flex w-full flex-col",
            isHome ? "max-w-3xl gap-4 md:gap-5" : "max-w-2xl gap-2 md:gap-3",
            align === "center" ? "items-center" : "items-start"
          )}
        >
          {resolvedEyebrow ? (
            <p className="text-xs font-bold tracking-wide text-[#6B8578] md:text-sm">{resolvedEyebrow}</p>
          ) : null}

          <h1
            className={cn(
              "font-heading font-extrabold leading-[1.25] text-[#1A3D32] text-balance",
              isHome ? "text-3xl sm:text-4xl md:text-5xl" : "text-2xl sm:text-3xl md:text-[2rem]"
            )}
          >
            {title}
          </h1>

          {subtitle ? (
            <p
              className={cn(
                "max-w-xl font-medium leading-relaxed text-[#6B8578]",
                isHome ? "text-base md:text-lg" : "text-sm md:text-base"
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {children ? (
          <div
            className={cn(
              "relative w-full",
              isHome ? "z-40 mt-4 max-w-3xl md:mt-5" : "mt-3 max-w-2xl",
              align === "center" ? "mx-auto" : ""
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
