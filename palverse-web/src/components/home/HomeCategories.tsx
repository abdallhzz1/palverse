import { CategoryCard } from "@/components/stores/CategoryCard";
import { serverFetch } from "@/lib/api/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function HomeCategories() {
  let categories: Record<string, unknown>[] = [];
  let error = false;

  try {
    const data = await serverFetch<{ data: unknown[] }>("/categories");
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    categories = items.slice(0, 10);
  } catch (err) {
    console.error("Failed to load categories server-side:", err);
    error = true;
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="public-section bg-white">
      <div className="public-container">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <p className="mb-1 text-xs font-bold text-[#6B8578]">تصفّح حسب الاهتمام</p>
            <h2 className="font-heading text-xl font-extrabold text-[#1A3D32] md:text-2xl">الفئات</h2>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2F6B4F] transition-colors hover:text-[#1A3D32]"
          >
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="overflow-x-auto pb-2 md:overflow-visible md:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex w-max gap-3 sm:gap-4 md:grid md:w-full md:grid-cols-8 md:gap-3 lg:grid-cols-10">
            {categories.map((cat, i) => (
              <div
                key={(cat.publicId as string) || (cat.public_id as string) || i}
                className="w-[76px] flex-none sm:w-[88px] md:w-auto"
              >
                <CategoryCard
                  name={(cat.name_ar as string) || (cat.name_en as string) || "فئة غير معروفة"}
                  slug={cat.slug as string}
                  iconName={(cat.icon as string) || "grid"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
