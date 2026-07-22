import Link from "next/link";
import Image from "next/image";
import { MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreCardProps {
  name: string;
  slug: string;
  categoryName: string;
  cityName: string;
  coverImage?: string;
  logoImage?: string;
  averageRating?: number;
  ratingsCount?: number;
}

export function StoreCard({
  name,
  slug,
  categoryName,
  cityName,
  coverImage,
  logoImage,
  averageRating,
  ratingsCount,
}: StoreCardProps) {
  const fallbackCover =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNFQUYzRUMiLz48L3N2Zz4=";

  const cleanCover =
    typeof coverImage === "string" && coverImage.trim()
      ? coverImage.trim()
      : fallbackCover;

  const cleanLogo =
    typeof logoImage === "string" && logoImage.trim()
      ? logoImage.trim()
      : null;

  return (
    <Link
      href={`/stores/${slug}`}
      className={cn(
        "flex flex-col bg-white dark:bg-[#1F2522] rounded-2xl md:rounded-3xl overflow-hidden group",
        "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.06)] border border-transparent",
        "hover:border-[#1E7D4E]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
      )}
    >
      {/* Cover Image */}
      <div className="relative w-full h-32 md:h-48 bg-[#EAF3EC] dark:bg-[#0F3D2E]/30 overflow-hidden">
        <Image
          src={cleanCover}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={true}
          className="object-cover transition-transform group-hover:scale-105 duration-700"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />

        {/* Rating badge — bottom start */}
        <div className="absolute bottom-2 start-2">
          {averageRating !== undefined && ratingsCount !== undefined && ratingsCount > 0 ? (
            <div className="bg-white/95 dark:bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] md:text-xs font-bold text-[#0F3D2E] dark:text-[#EAF3EC] shadow-sm">
              <span dir="ltr">{Number(averageRating).toFixed(1)}</span>
              <span className="text-yellow-400">★</span>
              <span className="text-[9px] md:text-[10px] text-gray-400 font-normal">({ratingsCount})</span>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-bold text-[#7FA789] shadow-sm">
              جديد
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-5 flex flex-col gap-1.5 md:gap-2.5 relative pt-6 md:pt-8">
        {/* Logo bubble overlapping cover */}
        <div className="absolute -top-6 md:-top-8 end-3 md:end-5 w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-[#1F2522] rounded-full border-2 md:border-4 border-white dark:border-[#1F2522] shadow-[0_2px_10px_rgba(0,0,0,0.12)] overflow-hidden flex items-center justify-center z-10 shrink-0">
          {cleanLogo ? (
            <Image
              src={cleanLogo}
              alt={`${name} Logo`}
              fill
              unoptimized={true}
              className="object-cover"
            />
          ) : (
            <span className="text-base md:text-xl font-extrabold text-[#1E7D4E]">
              {(name || "U").charAt(0)}
            </span>
          )}
        </div>

        <h3 className="text-sm md:text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] line-clamp-1 group-hover:text-[#1E7D4E] transition-colors">
          {name}
        </h3>

        <div className="flex flex-col md:flex-row items-start md:items-center text-[10px] md:text-xs font-medium text-[#7FA789] gap-1 md:gap-4">
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{categoryName}</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{cityName}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
