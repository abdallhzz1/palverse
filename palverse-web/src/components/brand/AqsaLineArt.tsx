import Image from "next/image";
import { cn } from "@/lib/utils";

export function AqsaLineArt({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative w-full h-32 opacity-20 pointer-events-none", className)} aria-hidden="true" {...props}>
      <Image
        src="/brand/illustrations/al-aqsa-line-art.png"
        alt="Al-Aqsa Mosque Silhouette"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain object-bottom opacity-20 dark:opacity-10"
      />
    </div>
  );
}
