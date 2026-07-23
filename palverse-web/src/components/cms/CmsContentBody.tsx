import { sanitizeHtmlContent } from "@/lib/security/sanitize-html";

interface CmsContentBodyProps {
  html?: string | null;
  emptyMessage?: string;
  className?: string;
}

export function CmsContentBody({
  html,
  emptyMessage = "لا يوجد محتوى لهذه الصفحة بعد.",
  className = "",
}: CmsContentBodyProps) {
  if (!html) {
    return <p className="text-[#7FA789] text-center py-12">{emptyMessage}</p>;
  }

  return (
    <div
      className={`text-[#1F2522] dark:text-[#EAF3EC] leading-relaxed text-base [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-[#0F3D2E] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-[#0F3D2E] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:mr-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:mr-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-[#1E7D4E] [&_a]:underline [&_strong]:font-bold [&_strong]:text-[#0F3D2E] dark:[&_strong]:text-[#7FA789] ${className}`}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(html) }}
    />
  );
}
