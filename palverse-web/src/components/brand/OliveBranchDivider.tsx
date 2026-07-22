import Image from "next/image";
import { cn } from "@/lib/utils";

export function OliveBranchDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full max-w-[200px] h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#7FA789] to-transparent", className)} aria-hidden="true">
      {/* Missing olive-branch-divider.png from assets, using CSS fallback */}
    </div>
  );
}
