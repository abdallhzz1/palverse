"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveStorageUrl } from "@/lib/media/resolve-storage-url";
import type { PartnerBannerItem } from "@/components/home/PartnerBannerSlider";
import { cn } from "@/lib/utils";

const MAX_ADS = 3;

export function StoreAdsPopup({ banners }: { banners: PartnerBannerItem[] }) {
  const ads = banners.slice(0, MAX_ADS);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ads.length === 0) return;
    const timer = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [ads.length]);

  useEffect(() => {
    if (!open || ads.length <= 1) return;
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [open, ads.length]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open || ads.length === 0) return null;

  const current = ads[index];
  const src =
    resolveStorageUrl(current.image_url) || resolveStorageUrl(current.image_path) || "";
  const storeName = current.store?.name_ar || current.store?.name_en || "إعلان ممول";
  const href = current.store?.slug ? `/stores/${current.store.slug}` : "/stores";

  const go = (next: number) => {
    setIndex((next + ads.length) % ads.length);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="إغلاق الإعلان"
        onClick={() => setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-ads-popup-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-[#E2EAE5] px-4 py-3">
          <div>
            <p id="store-ads-popup-title" className="text-sm font-bold text-[#1A3D32]">
              إعلانات ممولة
            </p>
            <p className="text-xs text-[#6B8578]">
              {ads.length === 1 ? "إعلان واحد" : `${ads.length} إعلانات`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-[#6B8578] transition-colors hover:bg-[#F7F9F8] hover:text-[#1A3D32]"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-[4/5] w-full bg-[#E8EEEA]">
          <Link href={href} className="group relative block h-full w-full" onClick={() => setOpen(false)}>
            {src ? (
              <Image
                src={src}
                alt={storeName}
                fill
                unoptimized
                priority
                sizes="(max-width: 640px) 100vw, 512px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#1A3D32]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D32]/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="mb-2 inline-flex rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-bold text-white">
                إعلان {index + 1} من {ads.length}
              </span>
              <h3 className="font-heading text-xl font-extrabold text-white">{storeName}</h3>
              <span className="mt-3 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#2F6B4F] transition-colors group-hover:bg-[#E8EEEA]">
                زيارة المحل
              </span>
            </div>
          </Link>

          {ads.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="absolute start-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#1A3D32] shadow-sm hover:bg-white"
                aria-label="الإعلان السابق"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="absolute end-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#1A3D32] shadow-sm hover:bg-white"
                aria-label="الإعلان التالي"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        {ads.length > 1 ? (
          <div className="flex gap-2 border-t border-[#E2EAE5] bg-[#F7F9F8] p-3">
            {ads.map((ad, i) => {
              const thumb =
                resolveStorageUrl(ad.image_url) || resolveStorageUrl(ad.image_path) || "";
              const label = ad.store?.name_ar || ad.store?.name_en || `إعلان ${i + 1}`;
              return (
                <button
                  key={ad.public_id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative min-w-0 flex-1 overflow-hidden rounded-lg border-2 transition-colors",
                    i === index ? "border-[#2F6B4F]" : "border-transparent opacity-80 hover:opacity-100"
                  )}
                  aria-label={label}
                >
                  <div className="relative aspect-[4/5] w-full bg-[#E8EEEA]">
                    {thumb ? (
                      <Image src={thumb} alt="" fill unoptimized sizes="120px" className="object-cover" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="border-t border-[#E2EAE5] p-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-xl bg-[#F7F9F8] py-2.5 text-sm font-bold text-[#1A3D32] transition-colors hover:bg-[#E8EEEA]"
          >
            متابعة تصفح المحل
          </button>
        </div>
      </div>
    </div>
  );
}
