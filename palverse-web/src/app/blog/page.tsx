import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { EmptyStateArt } from "@/components/public/EmptyStateArt";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

export const metadata = {
  title: "المدونة | Palverse",
};

export const dynamic = "force-dynamic";

interface Article {
  public_id: string;
  slug: string;
  title_ar: string;
  excerpt_ar?: string | null;
  cover_image?: string | null;
  views_count?: number;
  published_at?: string | null;
  created_at: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles`;
    const res = await fetch(url, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Fetch error in getArticles:", error);
    return [];
  }
}

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <PublicPageHero
        title="مدونة بالفيرس"
        subtitle="أحدث المقالات والنصائح والأخبار التي تهم أصحاب الأعمال والباحثين عن أفضل الخدمات في فلسطين."
        imageSrc={BRAND_PHOTOS.blog}
        imageAlt=""
        size="page"
        priority
      />

      <section className="public-container relative z-20 -mt-8 pb-20 md:-mt-10">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.public_id} className="public-card group flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-[#EAF3EC] md:h-56">
                  <Image
                    src={article.cover_image || BRAND_PHOTOS.blog}
                    alt={article.title_ar}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={!!article.cover_image}
                    className="object-cover duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/45 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="mb-3 line-clamp-2 font-heading text-xl font-bold text-[#0F3D2E]">
                    {article.title_ar}
                  </h2>
                  {article.excerpt_ar ? (
                    <p className="mb-6 line-clamp-3 flex-1 text-sm text-[#7FA789]">
                      {article.excerpt_ar}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <div className="mb-6 flex items-center justify-between border-b border-[#EAF3EC] pb-4 text-xs text-[#7FA789]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(article.published_at || article.created_at).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    {article.views_count !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        <span>{article.views_count} مشاهدة</span>
                      </div>
                    ) : null}
                  </div>

                  <Link
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-2 font-bold text-[#1E7D4E] transition-colors hover:text-[#0F3D2E]"
                  >
                    اقرأ المزيد
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyStateArt
            title="لا توجد مقالات منشورة بعد"
            description="نعمل على تجهيز مقالات ونصائح مفيدة، تابعنا قريباً."
          />
        )}
      </section>
    </div>
  );
}
