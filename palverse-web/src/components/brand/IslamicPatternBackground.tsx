import { cn } from "@/lib/utils";

export function IslamicPatternBackground({ className, opacity }: { className?: string; opacity?: number }) {
  return (
    <div
      className={cn("absolute inset-0 z-0 pointer-events-none", className)}
      style={{
        backgroundImage: "url('/brand/patterns/islamic-geometric-pattern.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "200px",
        opacity: opacity !== undefined ? opacity : 0.05,
      }}
      aria-hidden="true"
    />
  );
}
