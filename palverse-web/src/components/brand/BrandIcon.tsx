import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-8 h-8", className)}>
      <Image
        src="/brand/logo/palverse-icon.png"
        alt="Palverse Icon"
        fill
        sizes="32px"
        className="object-contain"
      />
    </div>
  );
}
