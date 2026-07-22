import { CategoryCard } from "@/components/stores/CategoryCard";
import { serverFetch } from "@/lib/api/server";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export async function HomeCategories() {
  let categories: Record<string, unknown>[] = [];
  let error = false;

  try {
    const data = await serverFetch<{ data: unknown[] }>("/categories");
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    categories = items.slice(0, 6);
  } catch (err) {
    console.error("Failed to load categories server-side:", err);
    error = true;
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="relative z-20 -mt-24 bg-transparent py-8 md:-mt-32 md:py-12">
      <div className="container mx-auto px-4">
        <div
          className="overflow-x-auto pb-4 pt-2 md:overflow-visible"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="mx-auto flex w-max max-w-full gap-3 sm:gap-6 md:w-full md:max-w-6xl md:justify-center lg:justify-start">
            {categories.map((cat, i) => (
              <div
                key={(cat.publicId as string) || (cat.public_id as string) || i}
                className="w-[72px] flex-none snap-start sm:w-[88px]"
              >
                <CategoryCard
                  name={(cat.name_ar as string) || (cat.name_en as string) || "فئة غير معروفة"}
                  slug={cat.slug as string}
                  iconName={(cat.icon as string) || "grid"}
                />
              </div>
            ))}

            <div className="w-[72px] flex-none snap-start sm:w-[88px]">
              <Link
                href="/categories"
                className="group flex h-full flex-col items-center justify-start"
              >
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-50 bg-white text-[#1E7D4E] shadow-sm transition-all group-hover:scale-110 group-hover:bg-emerald-50 group-hover:shadow-md sm:h-16 sm:w-16">
                  <MoreHorizontal className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="line-clamp-2 px-1 text-center text-[10px] font-bold leading-tight text-[#0F3D2E] sm:text-xs">
                  المزيد
                </h3>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
