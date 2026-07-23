"use client";

import { Phone, MessageCircle, QrCode, Share2, X } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";

interface StoreActionBarProps {
  name: string;
  phone?: string;
  whatsapp?: string;
  /** Absolute public store profile URL encoded into the QR (not the QR image endpoint). */
  storeUrl?: string;
}

export function StoreProfileCard({ name, phone, whatsapp, storeUrl }: StoreActionBarProps) {
  const [showQr, setShowQr] = useState(false);

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
      <div className="bg-white dark:bg-[#1F2522] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#0F3D2E] p-4 flex items-center justify-between gap-2 md:gap-4 overflow-x-auto no-scrollbar">
        {phone && (
          <a href={`tel:${phone}`} className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 min-w-[80px] py-3 rounded-xl bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#1E7D4E] hover:text-white transition-colors group">
            <Phone className="w-5 h-5 shrink-0" />
            <span className="text-xs md:text-sm font-bold">اتصال</span>
          </a>
        )}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 min-w-[80px] py-3 rounded-xl bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#1E7D4E] hover:text-white transition-colors group">
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs md:text-sm font-bold">مراسلة</span>
          </a>
        )}
        {storeUrl && (
          <button onClick={() => setShowQr(true)} className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 min-w-[80px] py-3 rounded-xl bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#1E7D4E] hover:text-white transition-colors group">
            <QrCode className="w-5 h-5 shrink-0" />
            <span className="text-xs md:text-sm font-bold">الباركود</span>
          </button>
        )}
        <button onClick={handleShare} className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 min-w-[80px] py-3 rounded-xl bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#1E7D4E] hover:text-white transition-colors group">
          <Share2 className="w-5 h-5 shrink-0" />
          <span className="text-xs md:text-sm font-bold">مشاركة</span>
        </button>
      </div>

      {showQr && storeUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1F2522] rounded-3xl p-8 max-w-sm w-full relative shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-6">مسح الباركود</h3>

            <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 mb-6 w-full max-w-[200px] aspect-square flex items-center justify-center relative">
              <QRCode value={storeUrl} size={180} />
            </div>

            <p className="text-center text-[#7FA789] text-sm">
              قم بمسح هذا الباركود للوصول المباشر إلى صفحة المتجر
            </p>
          </div>
        </div>
      )}
    </>
  );
}
