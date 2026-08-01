import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

interface StoreCardProps {
  name: string;
  slug?: string | null;
  publicId?: string | null;
  categoryName?: string;
  tags?: string[];
  cityName?: string;
  zoneName?: string;
  coverImage?: string;
  logoImage?: string;
  averageRating?: number;
  ratingsCount?: number;
  sponsored?: boolean;
  verified?: boolean;
}

export function StoreCard({
  name,
  slug,
  publicId,
  categoryName = "",
  tags = [],
  cityName = "",
  zoneName = "",
  coverImage,
  logoImage,
  averageRating,
  ratingsCount,
  sponsored = false,
  verified = false,
}: StoreCardProps) {
  const hrefSlug = (slug && String(slug).trim()) || (publicId && String(publicId).trim()) || "";
  if (!hrefSlug) {
    return null;
  }

  const cleanCover =
    typeof coverImage === "string" && coverImage.trim()
      ? coverImage.trim()
      : BRAND_PHOTOS.storeFallback;

  const cleanLogo =
    typeof logoImage === "string" && logoImage.trim() ? logoImage.trim() : null;

  const specialtyTags = (tags.length > 0 ? tags : categoryName ? [categoryName] : [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  const locationLabel = [cityName, zoneName].filter(Boolean).join(" — ");

  return (
    <Link
      href={`/stores/${hrefSlug}`}
      className={cn(
        "public-card group flex flex-col",
        "hover:-translate-y-1"
      )}
    >
      <div className="relative h-36 w-full overflow-hidden bg-[#EAF3EC] md:h-48">
        <Image
          src={cleanCover}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
          className="object-cover duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/55 via-transparent to-transparent" />

        <div className="absolute top-2 end-2 flex flex-col items-end gap-1">
          {verified ? (
            <div className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#1E7D4E] shadow-sm md:text-xs">
              <BadgeCheck className="h-3 w-3" />
              موثّق
            </div>
          ) : null}
          {sponsored ? (
            <div className="rounded-lg bg-[#1E7D4E] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm md:text-xs">
              مميز
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-2 start-2">
          {averageRating !== undefined && ratingsCount !== undefined && ratingsCount > 0 ? (
            <div className="flex items-center gap-1 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#0F3D2E] shadow-sm md:text-xs">
              <span dir="ltr">{Number(averageRating).toFixed(1)}</span>
              <span className="text-amber-400">★</span>
              <span className="text-[9px] font-normal text-[#7FA789] md:text-[10px]">({ratingsCount})</span>
            </div>
          ) : (
            <div className="rounded-lg bg-white/95 px-2 py-0.5 text-[9px] font-bold text-[#7FA789] shadow-sm md:text-[10px]">
              جديد
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-1.5 p-3 pt-7 md:gap-2 md:p-5 md:pt-9">
        <div className="absolute -top-6 end-3 z-10 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-md md:-top-8 md:end-5 md:h-14 md:w-14">
          {cleanLogo ? (
            <Image src={cleanLogo} alt="" fill unoptimized className="object-cover" />
          ) : (
            <span className="text-base font-extrabold text-[#1E7D4E] md:text-lg">
              {(name || "U").charAt(0)}
            </span>
          )}
        </div>

        <h3 className="line-clamp-1 font-heading text-sm font-bold text-[#0F3D2E] transition-colors group-hover:text-[#1E7D4E] md:text-lg">
          {name}
        </h3>

        {specialtyTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {specialtyTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[#EAF3EC] px-1.5 py-0.5 text-[9px] font-semibold text-[#1E7D4E] md:text-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {locationLabel ? (
          <div className="flex items-center gap-1 text-[10px] font-medium text-[#7FA789] md:text-xs">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
