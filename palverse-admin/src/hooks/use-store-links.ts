import { useState, useCallback, useEffect } from "react";
import { storesService } from "@/services/stores.service";
import { StoreLinksResponse } from "@/types/store";
import { toast } from "sonner";
import { normalizeApiError } from "@/lib/api/error";

export function useStoreLinks(publicId: string, slug?: string | null) {
  const [links, setLinks] = useState<StoreLinksResponse | null>(null);
  const [qrObjectUrl, setQrObjectUrl] = useState<string | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  // We only fetch links/QR if the store has a slug. The backend returns 404 or fails if no slug exists.
  const hasSlug = Boolean(slug);

  const fetchLinks = useCallback(async () => {
    if (!publicId || !hasSlug) return;
    setIsLoadingLinks(true);
    try {
      const data = await storesService.getLinks(publicId);
      setLinks(data);
    } catch (err) {
      // Intentionally silent or small toast to avoid disrupting the UI
      console.error("Failed to fetch store links", err);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [publicId, hasSlug]);

  const fetchQr = useCallback(async () => {
    if (!publicId || !hasSlug) return;
    setIsLoadingQr(true);
    try {
      const blob = await storesService.getQrBlob(publicId);
      const url = URL.createObjectURL(blob);
      setQrObjectUrl(url);
    } catch (err) {
      console.error("Failed to fetch QR code", err);
    } finally {
      setIsLoadingQr(false);
    }
  }, [publicId, hasSlug]);

  const downloadQr = useCallback(async (storeName: string) => {
    if (!qrObjectUrl) return;
    
    try {
      const a = document.createElement("a");
      a.href = qrObjectUrl;
      a.download = `qr_${storeName.replace(/\s+/g, "_")}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("تم تنزيل رمز QR بنجاح");
    } catch (err) {
      toast.error("حدث خطأ أثناء تنزيل رمز QR");
    }
  }, [qrObjectUrl]);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (qrObjectUrl) {
        URL.revokeObjectURL(qrObjectUrl);
      }
    };
  }, [qrObjectUrl]);

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (err) {
      toast.error("حدث خطأ أثناء النسخ");
    }
  };

  return {
    links,
    qrObjectUrl,
    isLoadingLinks,
    isLoadingQr,
    fetchLinks,
    fetchQr,
    downloadQr,
    copyToClipboard,
  };
}
