import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { notFound } from "next/navigation";
import { BRAND_PHOTOS } from "@/lib/brand-photos";

async function getArticle(slug: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/${slug}`;
    console.log("Fetching article from:", url);
    const res = await fetch(url, {
      next: { revalidate: 0 },
    });
    console.log("Article fetch status:", res.status);
    if (!res.ok) {
        console.error("Article fetch failed:", await res.text());
        return null;
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Fetch error in getArticle:", error);
    return null;
  }
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'مقال غير موجود' };
  
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
    <div className="flex min-h-screen flex-col bg-[#F5F7F6]">
      <div className="relative h-[320px] w-full md:h-[420px]">
        <Image
          src={article.cover_image || BRAND_PHOTOS.blog}
          alt={article.title_ar}
          fill
          className="object-cover"
          unoptimized={!!article.cover_image}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/85 via-[#0F3D2E]/25 to-[#0F3D2E]/10" />
      </div>

      <div className="container relative z-10 mx-auto -mt-28 px-4 pb-20 md:-mt-32">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-white/90 transition-colors hover:text-white"
          >
            <ArrowRight className="h-5 w-5" />
            العودة للمدونة
          </Link>

          <article className="rounded-[2rem] border border-[#EAF3EC] bg-white p-8 shadow-[0_1px_3px_rgba(15,61,46,0.06)] md:p-12">
            <h1 className="mb-6 font-heading text-3xl font-bold leading-tight text-[#0F3D2E] md:text-5xl">
              {article.title_ar}
            </h1>

            <div className="mb-10 flex flex-wrap items-center gap-6 border-b border-[#EAF3EC] pb-6 text-sm text-[#7FA789]">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span>{article.views_count} مشاهدة</span>
              </div>
            </div>

            <div className="max-w-none">
              {article.content_ar.split('\n').map((paragraph: string, i: number) => (
                paragraph.trim() ? (
                  <p key={i} className="mb-4 text-lg leading-loose text-[#1F2522]">
                    {paragraph}
                  </p>
                ) : null
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
