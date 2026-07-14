"use client";

import { PageForm } from "@/components/pages/page-form";
import { usePageDetails, usePageActions } from "@/hooks/use-pages";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function EditPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const { data: pageData, isLoading, error } = usePageDetails(resolvedParams.publicId);
  const { updatePage, isMutating, apiError } = usePageActions();

  if (isLoading) {
    return <div className="py-24 text-center text-slate-500">جاري تحميل بيانات الصفحة...</div>;
  }

  if (error || !pageData) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-600 mb-4">{error?.message || "لم يتم العثور على الصفحة"}</p>
        <Button asChild variant="outline">
          <Link href="/pages">العودة إلى الصفحات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/pages">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">تعديل الصفحة: {pageData.title_ar}</h1>
            <p className="text-sm text-slate-500 mt-1">تحديث محتوى الصفحة وإعدادات النشر</p>
          </div>
        </div>
        
        {pageData.is_published && (
          <Button asChild variant="outline" className="text-[#1E7D4E] border-[#1E7D4E] hover:bg-[#EAF3EC]">
            {/* Note: In a real environment, this URL would point to the public Next.js app URL from config */}
            <a href={`/page/${pageData.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="ml-2 h-4 w-4" />
              فتح الصفحة العامة
            </a>
          </Button>
        )}
      </div>

      <PageForm
        initialData={pageData}
        onSubmit={async (data) => {
          const res = await updatePage(resolvedParams.publicId, data);
          return !!res;
        }}
        isMutating={isMutating}
        apiError={apiError}
      />
    </div>
  );
}
