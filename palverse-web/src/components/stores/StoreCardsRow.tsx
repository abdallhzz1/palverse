import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile: single-row horizontal scroll.
 * md+: standard multi-column grid.
 */
export function StoreCardsRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:overflow-visible md:px-0 md:pb-0",
        className
      )}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="flex w-max snap-x snap-mandatory gap-3 md:grid md:w-full md:grid-cols-4 md:gap-6">
        {children}
      </div>
    </div>
  );
}

export function StoreCardsRowItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-[72vw] max-w-[260px] shrink-0 snap-start sm:w-[220px] md:w-auto md:max-w-none",
        className
      )}
    >
      {children}
    </div>
  );
}
