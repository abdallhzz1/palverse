import { Metadata } from "next";
import { AssignSubscriptionForm } from "@/components/subscriptions/assign-subscription-form";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "تعيين اشتراك جديد | Palverse",
  description: "تعيين اشتراك جديد لمحل في منصة بال فيرس",
};

export default function NewSubscriptionPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/subscriptions">
            <ArrowRight className="h-5 w-5" />
            <span className="sr-only">عودة</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تعيين اشتراك جديد</h1>
          <p className="text-sm text-slate-500 mt-1">تخصيص خطة اشتراك لمحل معين</p>
        </div>
      </div>

      <AssignSubscriptionForm />
    </div>
  );
}
