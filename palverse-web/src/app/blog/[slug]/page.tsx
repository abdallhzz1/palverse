import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { notFound } from "next/navigation";
import { BRAND_PHOTOS } from "@/lib/brand-photos";
import { PublicPageHero } from "@/components/public/PublicPageHero";

async function getArticle(slug: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/${slug}`;
    const res = await fetch(url, {
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Fetch error in getArticle:", error);
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "مقال غير موجود" };

  return {
    title: `${article.title_ar} | مدونة دليل فلسطين`,
    description: article.excerpt_ar,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <PublicPageHero
        title={article.title_ar}
        subtitle={article.excerpt_ar || undefined}
        size="page"
        eyebrow="المدونة"
      />

      <section className="public-container max-w-3xl pb-20 pt-8">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#2F6B4F] transition-colors hover:text-[#1A3D32]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمدونة
        </Link>

        {(article.cover_image || BRAND_PHOTOS.blog) && (
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#E2EAE5] bg-[#E8EEEA]">
            <Image
              src={article.cover_image || BRAND_PHOTOS.blog}
              alt={article.title_ar}
              fill
              className="object-cover"
              unoptimized={!!article.cover_image}
              priority
            />
          </div>
        )}

        <article className="rounded-xl border border-[#E2EAE5] bg-white p-6 md:p-10">
          <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-[#E2EAE5] pb-5 text-sm text-[#6B8578]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(article.published_at || article.created_at).toLocaleDateString("ar-SA")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{article.views_count} مشاهدة</span>
            </div>
          </div>

          <div className="max-w-none">
            {String(article.content_ar || "")
              .split("\n")
              .map((paragraph: string, i: number) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-4 text-base leading-loose text-[#3D554A] md:text-lg">
                    {paragraph}
                  </p>
                ) : null
              )}
          </div>
        </article>
      </section>
    </div>
  );
}
