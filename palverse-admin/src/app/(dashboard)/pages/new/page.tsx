"use client";

import { PageForm } from "@/components/pages/page-form";
import { usePageActions } from "@/hooks/use-pages";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewPage() {
  const { createPage, isMutating, apiError } = usePageActions();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/pages">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">إضافة صفحة جديدة</h1>
          <p className="text-sm text-muted-foreground mt-1">إنشاء صفحة ثابتة جديدة باللغتين العربية والإنجليزية</p>
        </div>
      </div>

      <PageForm
        onSubmit={async (data) => {
          const res = await createPage(data);
          return !!res;
        }}
        isMutating={isMutating}
        apiError={apiError}
      />
    </div>
  );
}
