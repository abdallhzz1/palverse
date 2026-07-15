import { Metadata } from "next";
import { PagesList } from "@/components/pages/pages-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الصفحات الثابتة | Palverse",
  description: "إدارة الصفحات الثابتة للمنصة",
};

export default function PagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الصفحات الثابتة</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة محتوى الصفحات مثل سياسة الخصوصية والشروط</p>
        </div>
        <Button asChild className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90">
          <Link href="/pages/new">
            <Plus className="ml-2 h-4 w-4" />
            إضافة صفحة
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border">
        <PagesList />
      </div>
    </div>
  );
}
