import Image from "next/image";
import type { ReactNode } from "react";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

interface AuthPageShellProps {
  children: ReactNode;
  /** Small tag shown above the caption on the image side */
  eyebrow?: string;
  /** Short supporting line shown over the image on desktop */
  caption?: string;
  /** Hide the side image entirely and rely on the soft green surface only */
  showImage?: boolean;
}

/**
 * Shared atmosphere for standalone auth pages (no site header/footer).
 * Desktop: soft green surface with card on one side, brand photo on the other.
 * Mobile: card floats over a subtle green-tinted surface.
 */
export function AuthPageShell({
  children,
  eyebrow = "بال فيرس للتجار",
  caption = "انضم إلى مئات التجار الذين يديرون أعمالهم بثقة عبر بال فيرس.",
  showImage = true,
}: AuthPageShellProps) {
  return (
    <div className="relative grid min-h-screen w-full overflow-hidden bg-[#F5F7F6] lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 lg:right-1/2" aria-hidden>
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#1E7D4E]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#0F3D2E]/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "url('/brand/patterns/islamic-geometric-pattern.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "300px",
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>

      {showImage ? (
        <div className="relative hidden lg:block">
          <Image
            src={BRAND_PHOTOS.auth}
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/85 via-[#0F3D2E]/25 to-[#0F3D2E]/10" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <p className="font-heading text-sm font-bold tracking-[0.2em] text-[#EAF3EC]/80">
              {eyebrow}
            </p>
            <p className="mt-4 max-w-sm font-heading text-2xl font-bold leading-snug">
              {caption}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
