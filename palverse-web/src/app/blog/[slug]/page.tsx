import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Eye, FileText } from "lucide-react";
import { notFound } from "next/navigation";

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
    <div className="flex flex-col min-h-screen bg-[#F9FBF9] dark:bg-[#171717]">
      {article.cover_image && (
        <div className="relative w-full h-[400px] md:h-[500px]">
          <Image 
            src={article.cover_image} 
            alt={article.title_ar} 
            fill 
            className="object-cover"
            unoptimized 
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للمدونة
          </Link>
          
          <article className="bg-white dark:bg-[#1F2522] rounded-3xl shadow-xl border border-[#EAF3EC] dark:border-[#0F3D2E] p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6 leading-tight">
              {article.title_ar}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{article.views_count} مشاهدة</span>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none prose-green">
              {article.content_ar.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
