"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { merchantService } from "@/services/merchant.service";
import type { MerchantStore } from "@/types/merchant";
import { Loader2, Download, Copy, ExternalLink, QrCode, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StoreQrPage() {
  const { publicId } = useParams() as { publicId: string };
  const [store, setStore] = useState<MerchantStore | null>(null);
  const [links, setLinks] = useState<{ web_url?: string; deep_link?: string } | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [storeData, linksData] = await Promise.all([
          merchantService.getStore(publicId),
          merchantService.getStoreLinks(publicId).catch((err) => {
            // Links might 409 if no slug exists
            if (err.status === 409) return null;
            throw err;
          }),
        ]);

        setStore(storeData);
        setLinks(linksData);

        if (linksData) {
          const qrBlob = await merchantService.getQrCode(publicId);
          objectUrl = URL.createObjectURL(qrBlob);
          setQrUrl(objectUrl);
        } else {
          setError("لم يتم تعيين رابط دائم للمحل بعد. رمز QR غير متاح حالياً.");
        }
      } catch (err: any) {
        if (err.status === 403) {
          setError("غير مصرح لك بالوصول إلى هذا المحل.");
        } else {
          setError(err.message || "حدث خطأ أثناء تحميل بيانات QR.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [publicId]);

  const handleCopyLink = () => {
    if (links?.web_url) {
      navigator.clipboard.writeText(links.web_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (qrUrl && store) {
      const a = document.createElement("a");
      a.href = qrUrl;
      a.download = `palverse-${store.slug || store.public_id}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
        <AlertTriangle className="w-12 h-12" />
        <p className="font-bold">{error}</p>
        <Link
          href={`/merchant/stores/${publicId}`}
          className="text-red-700 font-bold underline"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">رمز QR الخاص بالمحل</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          شارك هذا الرمز مع عملائك ليسهل عليهم الوصول لصفحة المتجر في بال فيرس.
        </p>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden p-8 flex flex-col items-center justify-center text-center">
        {qrUrl ? (
          <div className="space-y-6 w-full max-w-sm">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm inline-block mx-auto">
              <div className="relative w-64 h-64">
                <Image
                  src={qrUrl}
                  alt={`رمز QR لمتجر ${store.name_ar}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{store.name_ar}</h2>

            <div className="space-y-3 pt-4 border-t border-[#EAF3EC] dark:border-[#1F2522]">
              {links?.web_url && (
                <p className="text-sm text-gray-500 dark:text-gray-400 break-all" dir="ltr">
                  عند المسح يفتح:{" "}
                  <span className="font-mono text-[#0F3D2E] dark:text-[#EAF3EC]">{links.web_url}</span>
                </p>
              )}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1E7D4E] text-white rounded-xl font-bold hover:bg-[#0F3D2E] transition-colors"
              >
                <Download className="w-5 h-5" />
                تحميل رمز QR
              </button>

              {links?.web_url && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-[#252525] text-[#0F3D2E] dark:text-[#EAF3EC] rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#303030] transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                    {copied ? "تمت نسخ الرابط" : "نسخ رابط المحل"}
                  </button>
                  <a
                    href={links.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-gray-100 dark:bg-[#252525] text-[#0F3D2E] dark:text-[#EAF3EC] rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#303030] transition-colors"
                    title="فتح صفحة المحل"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 space-y-4">
            <QrCode className="w-16 h-16" />
            <p>رمز QR غير متوفر</p>
          </div>
        )}
      </div>
    </div>
  );
}
