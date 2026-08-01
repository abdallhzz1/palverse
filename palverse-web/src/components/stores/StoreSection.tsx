import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StoreSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-[#E2EAE5] bg-white p-5 md:p-6", className)}>
      <h2 className="mb-4 font-heading text-lg font-bold text-[#1A3D32] md:text-xl">{title}</h2>
      {children}
    </section>
  );
}
