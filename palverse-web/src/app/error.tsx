"use client";

import { useEffect } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = getDictionary("ar");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-4xl font-bold text-red-600 mb-4">!</h2>
      <p className="text-xl text-[#7FA789] mb-8">{dict.errors.somethingWentWrong}</p>
      <button
        onClick={() => reset()}
        className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white px-8 py-3 rounded-full font-bold transition-colors"
      >
        {dict.errors.retry}
      </button>
    </div>
  );
}
