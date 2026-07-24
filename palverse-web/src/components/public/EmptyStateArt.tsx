import Image from "next/image";
import Link from "next/link";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { cn } from "@/lib/utils";

interface EmptyStateArtProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function EmptyStateArt({
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: EmptyStateArtProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-3xl border border-[#EAF3EC] bg-white px-6 py-12 text-center",
        className
      )}
    >
      <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-2xl">
        <Image
          src={BRAND_PHOTOS.empty}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 384px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-xl font-bold text-[#0F3D2E]">{title}</h3>
        {description ? <p className="max-w-md text-sm font-medium text-[#7FA789]">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center rounded-full bg-[#1E7D4E] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0F3D2E]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
