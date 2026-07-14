import { PlanForm } from "@/components/subscription-plans/plan-form";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "إضافة خطة اشتراك - Palverse",
  description: "إضافة خطة اشتراك جديدة في Palverse",
};

export default function NewSubscriptionPlanPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/subscription-plans">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">إضافة خطة جديدة</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            أدخل تفاصيل خطة الاشتراك الجديدة
          </p>
        </div>
      </div>

      <PlanForm />
    </div>
  );
}
