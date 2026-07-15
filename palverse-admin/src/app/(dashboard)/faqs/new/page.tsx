"use client";

import { FaqForm } from "@/components/faqs/faq-form";
import { useFaqActions } from "@/hooks/use-faqs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewFaqPage() {
  const { createFaq, isMutating, apiError } = useFaqActions();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/faqs">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">إضافة سؤال جديد</h1>
          <p className="text-sm text-muted-foreground mt-1">إنشاء سؤال شائع جديد باللغتين العربية والإنجليزية</p>
        </div>
      </div>

      <FaqForm
        onSubmit={async (data) => {
          const res = await createFaq(data);
          return !!res;
        }}
        isMutating={isMutating}
        apiError={apiError}
      />
    </div>
  );
}
