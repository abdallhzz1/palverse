import { PlansList } from "@/components/subscription-plans/plans-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "خطط الاشتراك - Palverse",
  description: "إدارة خطط الاشتراك في Palverse",
};

export default function SubscriptionPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">خطط الاشتراك</h2>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">
            إدارة كافة خطط الاشتراك المتاحة للمتاجر
          </p>
        </div>
        <Button asChild className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white">
          <Link href="/subscription-plans/new">
            <Plus className="ml-2 h-4 w-4" />
            إضافة خطة جديدة
          </Link>
        </Button>
      </div>

      <PlansList />
    </div>
  );
}
