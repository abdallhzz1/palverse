"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowRight, Link as LinkIcon, Plus, Trash2, Edit2 } from "lucide-react";
import { StoreDetailNav } from "@/components/stores/store-detail-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStoreSocialLinks } from "@/hooks/use-store-social-links";
import type { NormalizedApiError } from "@/lib/api/error";
import type { SocialLinkPayload, SocialPlatform, StoreSocialLinkItem } from "@/types/store";

const PLATFORMS: { id: SocialPlatform; name: string }[] = [
  { id: "facebook", name: "فيسبوك" },
  { id: "instagram", name: "انستغرام" },
  { id: "x", name: "إكس (تويتر)" },
  { id: "snapchat", name: "سناب شات" },
  { id: "tiktok", name: "تيك توك" },
  { id: "linkedin", name: "لينكد إن" },
  { id: "youtube", name: "يوتيوب" },
  { id: "telegram", name: "تيليجرام" },
  { id: "other", name: "أخرى" },
];

const platformName = (platform: string) => PLATFORMS.find((p) => p.id === platform)?.name || platform;

export default function StoreSocialLinksPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const { links, isLoading, isSubmitting, create, update, remove } = useStoreSocialLinks(publicId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<StoreSocialLinkItem | null>(null);
  const [formData, setFormData] = useState<SocialLinkPayload>({ platform: "facebook", url: "" });
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StoreSocialLinkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = (link?: StoreSocialLinkItem) => {
    if (link) {
      setEditingLink(link);
      setFormData({ platform: link.platform, url: link.url });
    } else {
      setEditingLink(null);
      setFormData({ platform: "facebook", url: "" });
    }
    setApiError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    try {
      if (editingLink) {
        await update(editingLink.public_id, formData);
      } else {
        await create(formData);
      }
      closeModal();
    } catch (err) {
      setApiError(err as NormalizedApiError);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    await remove(pendingDelete.public_id);
    setIsDeleting(false);
    setPendingDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${publicId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">روابط التواصل الاجتماعي</h2>
        </div>
      </div>

      <StoreDetailNav publicId={publicId} />

      <div className="flex justify-end">
        <Button onClick={() => openModal()} className="gap-2 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white">
          <Plus className="w-4 h-4" />
          إضافة رابط جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : links.length === 0 ? (
        <div className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 p-12 text-center">
          <div className="w-20 h-20 bg-muted dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">لا توجد روابط مضافة</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            أضف روابط حسابات المحل على مواقع التواصل لتسهيل تواصل العملاء معه.
          </p>
          <Button onClick={() => openModal()} className="bg-[#0F3D2E] hover:bg-[#1E7D4E] text-white">
            إضافة رابط
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <div
              key={link.public_id}
              className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-muted dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <LinkIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground dark:text-white truncate">{platformName(link.platform)}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1E7D4E] dark:text-emerald-400 hover:underline truncate block"
                    dir="ltr"
                  >
                    {link.url}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openModal(link)}
                  className="p-2 text-muted-foreground hover:text-[#1E7D4E] hover:bg-muted dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPendingDelete(link)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingLink ? "تعديل الرابط" : "إضافة رابط جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg text-sm font-semibold border border-red-100 dark:border-red-900/40">
              <p>{apiError.message}</p>
              {apiError.details && (
                <ul className="list-disc pr-5 mt-1 font-normal">
                  {Object.values(apiError.details).flat().map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="platform">المنصة</Label>
            <select
              id="platform"
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as SocialPlatform })}
              className="flex h-10 w-full rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">الرابط (URL)</Label>
            <Input
              id="url"
              type="url"
              required
              dir="ltr"
              className="text-right"
              placeholder="https://"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting} className="flex-1">
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white">
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا الرابط؟"
        variant="danger"
        confirmText="حذف"
        isLoading={isDeleting}
      />
    </div>
  );
}
