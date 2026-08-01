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
        <span className="mb-1 font-bold text-xl uppercase leading-none tracking-wider text-[#1A3D32] md:text-2xl">
          Palverse
        </span>
        <span className="text-[10px] font-medium leading-none text-[#6B8578] md:text-[11px]">
          دليل فلسطين التجاري
        </span>
      </div>
    </div>
  );
}
