import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PublicPageHeroProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt?: string;
  children?: ReactNode;
  /** Compact height for secondary pages */
  size?: "home" | "page";
  align?: "center" | "start";
  className?: string;
  priority?: boolean;
}

export function PublicPageHero({
  title,
  subtitle,
  imageSrc,
  imageAlt = "",
  children,
  size = "page",
  align = "center",
  className,
  priority = false,
}: PublicPageHeroProps) {
  return (
    <section
      className={cn(
        "relative flex w-full overflow-hidden",
        size === "home" ? "min-h-[88vh] md:min-h-[92vh]" : "min-h-[42vh] md:min-h-[48vh]",
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-center animate-hero- ken"
      />

      {/* Soft green reading gradient — full-bleed image remains the visual plane */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/88 via-[#0F3D2E]/45 to-[#0F3D2E]/20"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0F3D2E]/35 md:to-[#0F3D2E]/50"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4",
          size === "home" ? "justify-center pb-28 pt-24 md:pb-36 md:pt-28" : "justify-end pb-14 pt-24 md:pb-20 md:pt-28",
          align === "center" ? "items-center text-center" : "items-start text-start"
        )}
      >
        <div
          className={cn(
            "animate-fade-up flex w-full flex-col gap-4 md:gap-5",
            align === "center" ? "items-center" : "items-start",
            size === "home" ? "max-w-3xl" : "max-w-2xl"
          )}
        >
          <p className="font-heading text-sm font-bold tracking-[0.2em] text-[#EAF3EC]/90 md:text-base">
            PALVERSE
          </p>
          <h1
            className={cn(
              "font-heading font-extrabold leading-[1.15] text-white text-balance",
              size === "home"
                ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                : "text-3xl sm:text-4xl md:text-5xl"
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={cn(
                "max-w-xl font-medium leading-relaxed text-[#EAF3EC]/95",
                size === "home" ? "text-base md:text-xl" : "text-sm md:text-lg"
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {children ? <div className={cn("w-full", size === "home" ? "mt-4 md:mt-8" : "mt-4")}>{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
