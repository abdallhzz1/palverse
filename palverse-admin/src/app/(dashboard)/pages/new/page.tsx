"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageForm } from "@/components/pages/page-form";
import { usePageActions } from "@/hooks/use-pages";
import { CreatePageRequest } from "@/types/pages";

export default function NewPagePage() {
  const router = useRouter();
  const { createPage, isMutating, apiError } = usePageActions();

  const handleSubmit = async (payload: CreatePageRequest) => {
    const page = await createPage(payload);
    if (page) {
      router.push("/pages");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href="/pages">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">إضافة صفحة جديدة</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">أنشئ صفحة محتوى ثابتة جديدة.</p>
        </div>
      </div>

      <PageForm isSubmitting={isMutating} apiError={apiError} onSubmit={handleSubmit} submitLabel="إنشاء الصفحة" />
    </div>
  );
}
