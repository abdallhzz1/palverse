import Image from "next/image";
import { cn } from "@/lib/utils";

export function DomeOfTheRockHero({ className, imageClassName }: { className?: string, imageClassName?: string }) {
  return (
    <div className={cn("relative w-full flex justify-center", className)} aria-hidden="true">
      <Image
        src="/brand/illustrations/dome-of-the-rock-watercolor.png"
        alt="Dome of the Rock Watercolor"
        width={1920}
        height={600}
        sizes="100vw"
        className={cn("w-full h-auto object-bottom", imageClassName)}
        priority
      />
    </div>
  );
}
