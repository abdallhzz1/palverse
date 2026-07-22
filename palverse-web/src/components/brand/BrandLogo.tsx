import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
        <Image
          src="/brand/logo/palverse-icon.png"
          alt="Palverse Icon"
          fill
          sizes="(max-width: 768px) 64px, 64px"
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col justify-center text-start">
        <span className="font-bold text-xl md:text-2xl tracking-wider text-[#0F3D2E] leading-none mb-1 uppercase">
          Palverse
        </span>
        <span className="text-[10px] md:text-[11px] text-[#7FA789] font-medium leading-none">
          دليل فلسطين التجاري
        </span>
      </div>
    </div>
  );
}
