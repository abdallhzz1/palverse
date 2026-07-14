"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
      <h2 className="text-2xl font-bold">حدث خطأ غير متوقع!</h2>
      <p className="text-muted-foreground">نعتذر عن هذا الخلل، يرجى المحاولة مرة أخرى.</p>
      <Button onClick={() => reset()} variant="primary">
        إعادة المحاولة
      </Button>
    </div>
  );
}
