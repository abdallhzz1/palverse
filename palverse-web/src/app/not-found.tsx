import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function NotFound() {
  const dict = getDictionary("ar");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-6xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4">404</h2>
      <p className="text-xl text-[#7FA789] mb-8">{dict.errors.notFound}</p>
      <Link 
        href="/"
        className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white px-8 py-3 rounded-full font-bold transition-colors"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
