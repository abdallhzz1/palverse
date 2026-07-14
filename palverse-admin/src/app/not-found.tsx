import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
      <h2 className="text-4xl font-bold text-latin">404</h2>
      <h3 className="text-xl font-medium">الصفحة غير موجودة</h3>
      <p className="text-muted-foreground">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.</p>
      <Link href="/">
        <Button variant="primary">العودة للرئيسية</Button>
      </Link>
    </div>
  );
}
