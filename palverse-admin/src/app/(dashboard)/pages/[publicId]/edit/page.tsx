"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageForm } from "@/components/pages/page-form";
import { usePageDetails, usePageActions } from "@/hooks/use-pages";
import { CreatePageRequest } from "@/types/pages";

export default function EditPagePage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();

  const { data: page, isLoading, error, refresh } = usePageDetails(publicId);
  const { updatePage, isMutating, apiError } = usePageActions();

  const handleSubmit = async (payload: CreatePageRequest) => {
    const updated = await updatePage(publicId, payload);
    if (updated) {
      router.push("/pages");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/pages" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة إلى الصفحات
        </Link>
        <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-lg border border-red-200 dark:border-red-800 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-bold mb-2">لم يتم العثور على الصفحة</h3>
          <Button variant="outline" className="mt-4" onClick={refresh}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href="/pages">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">تعديل الصفحة</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{page.title_ar}</p>
        </div>
      </div>

      <PageForm initial={page} isSubmitting={isMutating} apiError={apiError} onSubmit={handleSubmit} submitLabel="حفظ التعديلات" />
    </div>
  );
}
