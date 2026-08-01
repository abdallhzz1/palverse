"use client";

import { Phone, MessageCircle, QrCode, Share2, X } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { sanitizeExternalUrl } from "@/lib/security/urls";
import { SocialPlatformIcon, socialPlatformLabel } from "@/components/stores/SocialPlatformIcon";
import { cn } from "@/lib/utils";

export type StoreSocialLinkItem = {
  platform?: string;
  url?: string;
};

interface StoreActionBarProps {
  name: string;
  phone?: string;
  whatsapp?: string;
  /** Absolute public store profile URL encoded into the QR (not the QR image endpoint). */
  storeUrl?: string;
  socialLinks?: StoreSocialLinkItem[];
}

function ActionButton({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
    className
  );

  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function StoreProfileCard({
  name,
  phone,
  whatsapp,
  storeUrl,
  socialLinks = [],
}: StoreActionBarProps) {
  const [showQr, setShowQr] = useState(false);

  const safeSocialLinks = socialLinks
    .map((link) => ({
      platform: link.platform || "other",
      url: sanitizeExternalUrl(link.url),
    }))
    .filter((link): link is { platform: string; url: string } => Boolean(link.url));

  const handleShare = async () => {
    const shareUrl = storeUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `شاهد متجر ${name} على بال فيرس!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert("تم نسخ الرابط!");
    }
  };

  return (
    <>
      <div className="rounded-xl border border-[#E2EAE5] bg-white p-3 md:p-4">
        <div className="flex flex-wrap gap-2">
          {phone ? (
            <ActionButton
              href={`tel:${phone}`}
              className="bg-[#2F6B4F] text-white hover:bg-[#1A3D32]"
            >
              <Phone className="h-4 w-4" />
              اتصال
            </ActionButton>
          ) : null}
          {whatsapp ? (
            <ActionButton
              href={`https://wa.me/${whatsapp}`}
              className="bg-[#E8EEEA] text-[#1A3D32] hover:bg-[#2F6B4F] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              واتساب
            </ActionButton>
          ) : null}
          {storeUrl ? (
            <ActionButton
              onClick={() => setShowQr(true)}
              className="bg-[#F7F9F8] text-[#1A3D32] hover:bg-[#E8EEEA]"
            >
              <QrCode className="h-4 w-4" />
              QR
            </ActionButton>
          ) : null}
          <ActionButton
            onClick={handleShare}
            className="bg-[#F7F9F8] text-[#1A3D32] hover:bg-[#E8EEEA]"
          >
            <Share2 className="h-4 w-4" />
            مشاركة
          </ActionButton>
        </div>

        {safeSocialLinks.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E2EAE5] pt-3">
            {safeSocialLinks.map((link) => (
              <a
                key={`${link.platform}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                title={socialPlatformLabel(link.platform)}
                aria-label={socialPlatformLabel(link.platform)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2EAE5] text-[#2F6B4F] transition-colors hover:border-[#2F6B4F]/40 hover:bg-[#E8EEEA]"
              >
                <SocialPlatformIcon platform={link.platform} />
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {showQr && storeUrl ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative flex w-full max-w-sm flex-col items-center rounded-2xl border border-[#E2EAE5] bg-white p-8">
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="absolute top-4 end-4 rounded-lg p-2 text-[#6B8578] transition-colors hover:bg-[#F7F9F8]"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-6 font-heading text-xl font-bold text-[#1A3D32]">مسح الباركود</h3>

            <div className="mb-6 flex aspect-square w-full max-w-[200px] items-center justify-center rounded-xl border border-[#E2EAE5] bg-white p-4">
              <QRCode value={storeUrl} size={180} />
            </div>

            <p className="text-center text-sm text-[#6B8578]">
              امسح الباركود للوصول المباشر إلى صفحة المتجر
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
