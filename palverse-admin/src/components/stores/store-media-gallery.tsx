import { StoreMediaSummary } from "@/types/store";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface StoreMediaGalleryProps {
  logo?: StoreMediaSummary;
  cover?: StoreMediaSummary;
  gallery?: StoreMediaSummary[];
}

export function StoreMediaGallery({ logo, cover, gallery }: StoreMediaGalleryProps) {
  if (!logo && !cover && (!gallery || gallery.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 bg-slate-50 dark:bg-slate-800/50">
        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">لا توجد وسائط لهذا المحل</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover and Logo Section */}
      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="h-48 sm:h-64 bg-slate-100 dark:bg-slate-900 relative">
          {cover ? (
            <img 
              src={cover.url} 
              alt="صورة الغلاف" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-store.jpg";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-sm">لا توجد صورة غلاف</span>
            </div>
          )}
        </div>
        
        <div className="px-6 pb-6 pt-16 relative">
          <div className="absolute -top-12 sm:-top-16 right-6 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 dark:bg-slate-900 rounded relative overflow-hidden flex items-center justify-center">
              {logo ? (
                <img 
                  src={logo.url} 
                  alt="شعار المحل" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-store.jpg";
                  }}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {gallery && gallery.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">معرض الصور</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((media) => (
              <div key={media.public_id} className="aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                <img 
                  src={media.url} 
                  alt="صورة من المعرض" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
