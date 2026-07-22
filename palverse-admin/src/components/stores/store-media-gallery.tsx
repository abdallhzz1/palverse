"use client";

import { StoreMediaSummary } from "@/types/store";
import { Image as ImageIcon, Trash2, Upload, Plus } from "lucide-react";
import { useState } from "react";
import { useStoreMedia } from "@/hooks/use-store-details";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StoreMediaGalleryProps {
  logo?: StoreMediaSummary;
  cover?: StoreMediaSummary;
  gallery?: StoreMediaSummary[];
  /** When provided together with onRefresh, enables admin media management (upload/delete). */
  storePublicId?: string;
  onRefresh?: () => void;
}

type PendingDelete =
  | { kind: "logo" }
  | { kind: "cover" }
  | { kind: "gallery"; mediaId: string };

export function StoreMediaGallery({ logo, cover, gallery, storePublicId, onRefresh }: StoreMediaGalleryProps) {
  const manageable = Boolean(storePublicId && onRefresh);
  const media = useStoreMedia(storePublicId ?? "", onRefresh);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const handleUpload = (kind: "logo" | "cover" | "gallery", file: File | undefined) => {
    if (!file || !manageable) return;
    if (kind === "logo") media.uploadLogo(file);
    else if (kind === "cover") media.uploadCover(file);
    else media.uploadGallery(file);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "logo") await media.deleteLogo();
    else if (pendingDelete.kind === "cover") await media.deleteCover();
    else await media.deleteGallery(pendingDelete.mediaId);
    setPendingDelete(null);
  };

  const isEmpty = !logo && !cover && (!gallery || gallery.length === 0);

  if (isEmpty && !manageable) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-muted-foreground bg-muted dark:bg-slate-800/50">
        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">لا توجد وسائط لهذا المحل</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover and Logo Section */}
      <div className="relative rounded-lg overflow-hidden border border-border dark:border-slate-700 bg-card dark:bg-slate-800">
        <div className="h-48 sm:h-64 bg-muted dark:bg-slate-900 relative">
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
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-sm">لا توجد صورة غلاف</span>
            </div>
          )}

          {manageable && (
            <div className="absolute top-3 left-3 flex gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-card/90 dark:bg-slate-900/90 border border-border dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-card transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {cover ? "تغيير الغلاف" : "رفع غلاف"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={media.isUploading}
                  onChange={(e) => {
                    handleUpload("cover", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {cover && (
                <button
                  type="button"
                  onClick={() => setPendingDelete({ kind: "cover" })}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                  aria-label="حذف صورة الغلاف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-16 relative">
          <div className="absolute -top-12 sm:-top-16 right-6 p-1 bg-card dark:bg-slate-800 rounded-lg border border-border dark:border-slate-700">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted dark:bg-slate-900 rounded relative overflow-hidden flex items-center justify-center">
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
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          </div>

          {manageable && (
            <div className="flex justify-start gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#EAF3EC] text-[#0F3D2E] border border-[#1E7D4E]/20 hover:bg-[#dcefe1] transition-colors dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                <Upload className="w-3.5 h-3.5" />
                {logo ? "تغيير الشعار" : "رفع شعار"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={media.isUploading}
                  onChange={(e) => {
                    handleUpload("logo", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {logo && (
                <button
                  type="button"
                  onClick={() => setPendingDelete({ kind: "logo" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف الشعار
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      {(gallery && gallery.length > 0) || manageable ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-foreground dark:text-white">معرض الصور</h4>
            {manageable && (
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#1E7D4E] text-white hover:bg-[#0F3D2E] transition-colors">
                <Plus className="w-3.5 h-3.5" />
                إضافة صورة
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={media.isUploading}
                  onChange={(e) => {
                    handleUpload("gallery", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          {gallery && gallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.public_id}
                  className="group aspect-square rounded-lg border border-border dark:border-slate-700 overflow-hidden bg-muted dark:bg-slate-900 relative"
                >
                  <img src={item.url} alt="صورة من المعرض" className="w-full h-full object-cover" loading="lazy" />
                  {manageable && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ kind: "gallery", mediaId: item.public_id })}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        aria-label="حذف الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-muted-foreground text-sm">
              لا توجد صور في المعرض
            </div>
          )}
        </div>
      ) : null}

      {manageable && (
        <ConfirmDialog
          isOpen={pendingDelete !== null}
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          title="تأكيد الحذف"
          description={
            pendingDelete?.kind === "logo"
              ? "هل أنت متأكد من حذف شعار المحل؟"
              : pendingDelete?.kind === "cover"
              ? "هل أنت متأكد من حذف صورة الغلاف؟"
              : "هل أنت متأكد من حذف هذه الصورة من المعرض؟"
          }
          variant="danger"
          confirmText="حذف"
          isLoading={media.isDeleting}
        />
      )}
    </div>
  );
}
