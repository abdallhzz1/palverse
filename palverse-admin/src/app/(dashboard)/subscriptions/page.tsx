import { Metadata } from "next";
import { SubscriptionsList } from "@/components/subscriptions/subscriptions-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "إدارة الاشتراكات | Palverse",
  description: "إدارة اشتراكات المحلات في منصة بال فيرس",
};

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الاشتراكات</h1>
          <p className="text-sm text-muted-foreground mt-1">عرض وإدارة اشتراكات المحلات في المنصة</p>
        </div>
        
        <Button asChild className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white">
          <Link href="/subscriptions/new">
            <Plus className="ml-2 h-4 w-4" />
            تعيين اشتراك جديد
          </Link>
        </Button>
      </div>

      <SubscriptionsList />
    </div>
  );
}
