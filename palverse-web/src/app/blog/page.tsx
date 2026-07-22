import { BrandSectionHeading } from "@/components/brand/BrandSectionHeading";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Eye, FileText } from "lucide-react";

export const metadata = {
  title: 'المدونة | دليل فلسطين',
};

export const dynamic = 'force-dynamic';

async function getArticles() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles`;
    console.log("Fetching articles from:", url);
    const res = await fetch(url, {
      next: { revalidate: 0 },
    });
    console.log("Response status:", res.status);
    if (!res.ok) {
        console.error("Failed to fetch articles:", await res.text());
        return [];
    }
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
    <div className="flex flex-col min-h-screen">
      {/* Blog Header */}
      <section className="bg-[#0F3D2E] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">مدونة دليل فلسطين</h1>
          <p className="text-[#7FA789] text-lg max-w-2xl mx-auto">
            أحدث المقالات، النصائح، والأخبار التي تهم أصحاب الأعمال والباحثين عن أفضل الخدمات في فلسطين.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-[#F9FBF9] dark:bg-[#171717] flex-1">
        <div className="container mx-auto px-4">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any) => (
                <article key={article.public_id} className="bg-white dark:bg-[#1F2522] rounded-3xl overflow-hidden shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] group hover:shadow-xl transition-shadow flex flex-col">
                  {article.cover_image && (
                    <div className="relative h-56 overflow-hidden">
                      <Image 
                        src={article.cover_image} 
                        alt={article.title_ar} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized 
                      />
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-3 line-clamp-2">
                      {article.title_ar}
                    </h2>
                    <p className="text-[#7FA789] text-sm mb-6 line-clamp-3 flex-1">
                      {article.excerpt_ar}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>{article.views_count} مشاهدة</span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/blog/${article.slug}`} 
                      className="inline-flex items-center gap-2 text-[#1E7D4E] font-bold hover:text-[#0F3D2E] dark:hover:text-[#EAF3EC] transition-colors"
                    >
                      اقرأ المزيد
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">لا توجد مقالات منشورة بعد</h3>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
