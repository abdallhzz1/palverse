"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { Upload, Trash2, Image as ImageIcon, Camera, Plus } from "lucide-react";
import { merchantService } from "@/services/merchant.service";

export default function StoreMediaPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Instead of fetching all media at once, our backend currently returns logo_url and cover_url on the store object.
  // Wait, does the API have an endpoint to list gallery? The gallery might be nested in the store response, or we need to fetch the full store which includes media.
  // The API v1.0.0 documentation mentions:
  // POST /api/v1/merchant/stores/{store_id}/logo
  // POST /api/v1/merchant/stores/{store_id}/cover
  // POST /api/v1/merchant/stores/{store_id}/gallery
  
  // Let's assume `getStore` returns `logo_url`, `cover_url`, and `media` array with roles.
  const loadStore = async () => {
    try {
      setIsLoading(true);
      const res = await merchantService.getStore(resolvedParams.publicId);
      setStore(res);
    } catch (err) {
      setError("فشل في تحميل الوسائط.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [resolvedParams.publicId]);

  const handleUpload = async (type: 'logo' | 'cover' | 'gallery', file: File) => {
    try {
      if (type === 'logo') {
        await merchantService.uploadLogo(resolvedParams.publicId, file);
      } else if (type === 'cover') {
        await merchantService.uploadCover(resolvedParams.publicId, file);
      } else if (type === 'gallery') {
        await merchantService.uploadGalleryImage(resolvedParams.publicId, file);
      }
      await loadStore(); // Reload to get new URLs
    } catch (err: any) {
      let msg = err?.response?.data?.message || err?.message || "فشل رفع الملف. يرجى التأكد من الحجم والصيغة.";
      
      // Extract specific validation errors if available
      const details = err?.response?.data?.error?.details || err?.response?.data?.errors;
      if (details && typeof details === 'object') {
        const errorMessages = Object.values(details).flat().join('\n');
        if (errorMessages) {
          msg += '\n\nالتفاصيل:\n' + errorMessages;
        }
      }
      
      alert(msg);
    }
  };

  const handleDelete = async (type: 'logo' | 'cover' | 'gallery', mediaId?: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    
    try {
      if (type === 'logo') {
        await merchantService.deleteLogo(resolvedParams.publicId);
      } else if (type === 'cover') {
        await merchantService.deleteCover(resolvedParams.publicId);
      } else if (type === 'gallery' && mediaId) {
        await merchantService.deleteGalleryImage(resolvedParams.publicId, mediaId);
      }
      await loadStore();
    } catch (err) {
      alert("فشل حذف الملف.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const galleryImages = store?.gallery || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
        الصور والشعار
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Section */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">شعار المحل</h2>
            {store?.logo?.url && (
              <button onClick={() => handleDelete('logo')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 relative rounded-full border-4 border-gray-100 dark:border-gray-800 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-[#252525]">
              {store?.logo?.url ? (
                <Image src={store?.logo?.url} alt="Logo" fill unoptimized={true} className="object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors">
              <Upload className="w-4 h-4" />
              تغيير الشعار
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload('logo', e.target.files[0])} />
            </label>
            <p className="text-xs text-gray-500">موصى به: 512x512 بكسل (PNG, JPG)</p>
          </div>
        </div>

        {/* Cover Section */}
        <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">صورة الغلاف</h2>
            {store?.cover?.url && (
              <button onClick={() => handleDelete('cover')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="h-32 w-full relative rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-[#252525]">
              {store?.cover?.url ? (
                <Image src={store?.cover?.url} alt="Cover" fill unoptimized={true} className="object-cover" />
              ) : (
                <Camera className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors w-max mx-auto">
              <Upload className="w-4 h-4" />
              تغيير الغلاف
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload('cover', e.target.files[0])} />
            </label>
            <p className="text-xs text-gray-500 text-center">موصى به: 1920x1080 بكسل (PNG, JPG)</p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white dark:bg-[#171717] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">معرض الصور</h2>
            <p className="text-sm text-gray-500">أضف صوراً إضافية لمحلك لعرضها للزبائن</p>
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors">
            <Plus className="w-4 h-4" />
            إضافة صورة
            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload('gallery', e.target.files[0])} />
          </label>
        </div>

        {galleryImages.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد صور في المعرض</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img: any) => (
              <div key={img.public_id} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image src={img.url} alt="Gallery image" fill unoptimized={true} className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete('gallery', img.public_id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
