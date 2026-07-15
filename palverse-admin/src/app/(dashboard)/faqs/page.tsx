import { Metadata } from "next";
import { FaqsList } from "@/components/faqs/faqs-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | Palverse",
  description: "إدارة الأسئلة الشائعة في المنصة",
};

export default function FaqsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الأسئلة الشائعة</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة الأسئلة التي تظهر للعامة للإجابة عن استفساراتهم</p>
        </div>
        <Button asChild className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90">
          <Link href="/faqs/new">
            <Plus className="ml-2 h-4 w-4" />
            إضافة سؤال
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border">
        <FaqsList />
      </div>
    </div>
  );
}
