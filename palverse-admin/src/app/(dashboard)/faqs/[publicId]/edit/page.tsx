"use client";

import { FaqForm } from "@/components/faqs/faq-form";
import { useFaqDetails, useFaqActions } from "@/hooks/use-faqs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function EditFaqPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const { data: faqData, isLoading, error } = useFaqDetails(resolvedParams.publicId);
  const { updateFaq, isMutating, apiError } = useFaqActions();

  if (isLoading) {
    return <div className="py-24 text-center text-slate-500">جاري تحميل بيانات السؤال...</div>;
  }

  if (error || !faqData) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-600 mb-4">{error?.message || "لم يتم العثور على السؤال"}</p>
        <Button asChild variant="outline">
          <Link href="/faqs">العودة إلى الأسئلة الشائعة</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/faqs">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تعديل السؤال الشائع</h1>
          <p className="text-sm text-slate-500 mt-1">تحديث بيانات السؤال وحالته</p>
        </div>
      </div>

      <FaqForm
        initialData={faqData}
        onSubmit={async (data) => {
          const res = await updateFaq(resolvedParams.publicId, data);
          return !!res;
        }}
        isMutating={isMutating}
        apiError={apiError}
      />
    </div>
  );
}
