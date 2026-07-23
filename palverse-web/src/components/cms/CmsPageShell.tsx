import { IslamicPatternBackground } from "@/components/brand/IslamicPatternBackground";
import type { ReactNode } from "react";

interface CmsPageShellProps {
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  children: ReactNode;
}

export function CmsPageShell({ title, subtitle, eyebrow, children }: CmsPageShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F7F6]/50">
      <section className="relative w-full bg-[#0F3D2E] pt-20 md:pt-28 pb-28 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <IslamicPatternBackground />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E7D4E]/30 via-[#0F3D2E]/80 to-[#0F3D2E] opacity-50 z-0 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          {eyebrow ? (
            <p className="text-[#7FA789] font-semibold mb-4 tracking-wide">{eyebrow}</p>
          ) : null}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-lg md:text-xl text-[#EAF3EC] max-w-2xl mx-auto font-medium leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-[#F5F7F6]/50"
          style={{ borderTopLeftRadius: "50% 100%", borderTopRightRadius: "50% 100%" }}
        />
      </section>

      <section className="container mx-auto px-4 -mt-14 md:-mt-20 relative z-20 pb-20">
        {children}
      </section>
    </div>
  );
}
