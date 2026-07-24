import { sanitizeHtmlContent } from "@/lib/security/sanitize-html";

interface CmsContentBodyProps {
  html?: string | null;
  emptyMessage?: string;
  className?: string;
}

/** Split a wall-of-text into readable Arabic paragraphs when CMS has no structure. */
function enhancePlainHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return trimmed;

  // Already has multiple block elements / headings — keep as authored
  const blockCount = (trimmed.match(/<\/(p|h[1-6]|li|div|blockquote|section)>/gi) || []).length;
  if (blockCount > 2) return trimmed;

  const textOnly = trimmed
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (textOnly.length < 160) return trimmed;

  // Split on Arabic/Latin sentence enders while keeping the delimiter
  const sentences = textOnly
    .split(/(?<=[.!?؟。])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length < 2) {
    // Fallback: soft-split long blob every ~180 chars at nearest space
    const chunks: string[] = [];
    let rest = textOnly;
    while (rest.length > 200) {
      let cut = rest.lastIndexOf(" ", 180);
      if (cut < 80) cut = 180;
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) chunks.push(rest);
    return chunks.map((c) => `<p>${escapeHtml(c)}</p>`).join("");
  }

  // Group 1–2 sentences per paragraph for comfortable reading
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(" "));
  }

  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function CmsContentBody({
  html,
  emptyMessage = "لا يوجد محتوى لهذه الصفحة بعد.",
  className = "",
}: CmsContentBodyProps) {
  if (!html) {
    return <p className="py-12 text-center text-[#7FA789]">{emptyMessage}</p>;
  }

  const enhanced = enhancePlainHtml(html);
  const sanitized = sanitizeHtmlContent(enhanced);

  return (
    <div
      className={`cms-prose text-[#0F3D2E] ${className}`}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
