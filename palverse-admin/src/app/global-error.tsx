"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center p-4">
          <h2 className="text-2xl font-bold">حدث خطأ فادح في النظام!</h2>
          <Button onClick={() => reset()} variant="primary">
            تحديث الصفحة
          </Button>
        </div>
      </body>
    </html>
  );
}
