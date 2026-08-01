import Link from "next/link";
import { ArrowLeft, Compass, HeartHandshake, Store } from "lucide-react";
import { sanitizeHtmlContent } from "@/lib/security/sanitize-html";

type CmsAboutLayoutProps = {
  html?: string | null;
  excerpt?: string | null;
  updatedAt?: string | null;
};

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Turn CMS HTML into short readable chunks (avoids one newspaper wall). */
function extractChunks(html: string): string[] {
  const trimmed = html.trim();
  if (!trimmed) return [];

  const paragraphMatches = [...trimmed.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  if (paragraphMatches.length >= 2) {
    return paragraphMatches
      .map((m) => stripTags(m[1]))
      .filter((t) => t.length > 0);
  }

  const headingSplit = trimmed
    .split(/<\/?h[1-6][^>]*>/gi)
    .map(stripTags)
    .filter((t) => t.length > 20);

  if (headingSplit.length >= 2) return headingSplit;

  const text = stripTags(trimmed);
  if (!text) return [];

  const sentences = text
    .split(/(?<=[.!?؟。])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 2) {
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      chunks.push(sentences.slice(i, i + 2).join(" "));
    }
    return chunks;
  }

  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 160) {
    let cut = rest.lastIndexOf(" ", 140);
    if (cut < 60) cut = 140;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/** Merge story points 3 and 4 into one card. */
function mergeStoryPoints(chunks: string[]): string[] {
  if (chunks.length < 4) return chunks;
  const next = [...chunks];
  const merged = `${next[2]} ${next[3]}`.replace(/\s+/g, " ").trim();
  next.splice(2, 2, merged);
  return next;
}

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: "دليل محلي واضح",
    text: "نساعد الزوار على اكتشاف الأعمال والخدمات في مدن فلسطين بسهولة.",
  },
  {
    icon: Store,
    title: "منصة للتجار",
    text: "نعطي أصحاب المحلات حضوراً رقمياً بسيطاً وفعّالاً للوصول إلى عملائهم.",
  },
  {
    icon: HeartHandshake,
    title: "شراكة موثوقة",
    text: "نبني تجربة هادئة وموثوقة تربط بين التاجر والعميل دون تعقيد.",
  },
];

export function CmsAboutLayout({ html, excerpt, updatedAt }: CmsAboutLayoutProps) {
  const chunks = html ? extractChunks(sanitizeHtmlContent(html)) : [];
  const excerptText = normalizeText(excerpt || "");

  // Keep every CMS story point. Only drop an exact duplicate of the hero excerpt.
  let body = excerptText
    ? chunks.filter((c) => normalizeText(c) !== excerptText)
    : [...chunks];

  // Merge points 3 and 4 into one (1-based).
  body = mergeStoryPoints(body);

  return (
    <div className="mx-auto max-w-5xl space-y-10 md:space-y-14">
      <div
        className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:overflow-visible md:px-0 md:pb-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex w-max gap-3 md:grid md:w-full md:grid-cols-3 md:gap-4">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="w-[78vw] max-w-[280px] shrink-0 rounded-2xl border border-[#E2EAE5] bg-white p-5 text-center sm:w-[240px] md:w-auto md:max-w-none md:p-6 md:text-start"
            >
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] text-[#2F6B4F] md:mx-0">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#1A3D32]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#6B8578]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {body.length > 0 ? (
        <div className="space-y-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-heading text-xl font-extrabold text-[#1A3D32] md:text-2xl">
              قصتنا باختصار
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {body.map((chunk, i) => (
              <article
                key={i}
                className="rounded-2xl border border-[#E2EAE5] bg-white p-5 md:p-6"
              >
                <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E8EEEA] text-xs font-bold text-[#2F6B4F]">
                  {i + 1}
                </span>
                <p className="text-[15px] leading-7 text-[#3D554A]">{chunk}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#E2EAE5] bg-[#1A3D32] px-6 py-8 text-center text-white md:px-10 md:py-10">
        <h2 className="font-heading text-2xl font-extrabold md:text-3xl">جاهز تتعرّف علينا أكثر؟</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/80 md:text-base">
          تصفّح الدليل، أو تواصل معنا، أو أضف نشاطك التجاري وابدأ الظهور لعملائك.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#1A3D32] transition-colors hover:bg-[#E8EEEA]"
          >
            استكشف المحلات
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/join-us"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            أضف نشاطك
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            تواصل معنا
          </Link>
        </div>
      </div>

      {updatedAt ? (
        <p className="text-center text-xs text-[#6B8578]">
          آخر تحديث:{" "}
          {new Date(updatedAt).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      ) : null}
    </div>
  );
}
