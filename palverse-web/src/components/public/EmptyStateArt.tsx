import Link from "next/link";
import { Search } from "lucide-react";
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
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#E2EAE5] bg-white px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] text-[#2F6B4F]">
        <Search className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-lg font-bold text-[#1A3D32]">{title}</h3>
        {description ? (
          <p className="max-w-md text-sm font-medium leading-relaxed text-[#6B8578]">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center rounded-lg bg-[#2F6B4F] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1A3D32]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
