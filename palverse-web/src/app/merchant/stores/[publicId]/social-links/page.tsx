"use client";

import { useEffect, useState, use } from "react";
import { Link as LinkIcon, Plus, Trash2, Edit2, CheckCircle, X } from "lucide-react";
import { merchantService } from "@/services/merchant.service";
import type { SocialLink } from "@/types/merchant";

const PLATFORMS = [
  { id: "facebook", name: "فيسبوك" },
  { id: "instagram", name: "انستغرام" },
  { id: "twitter", name: "تويتر / X" },
  { id: "snapchat", name: "سناب شات" },
  { id: "tiktok", name: "تيك توك" },
  { id: "linkedin", name: "لينكد إن" },
  { id: "youtube", name: "يوتيوب" },
];

export default function StoreSocialLinksPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ platform: "facebook", url: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLinks = async () => {
    try {
      const res = await merchantService.getSocialLinks(resolvedParams.publicId);
      setLinks(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [resolvedParams.publicId]);

  const openModal = (link?: SocialLink) => {
    if (link) {
      setEditingId(link.public_id);
      setFormData({ platform: link.platform, url: link.url });
    } else {
      setEditingId(null);
      setFormData({ platform: "facebook", url: "" });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingId) {
        await merchantService.updateSocialLink(resolvedParams.publicId, editingId, formData);
      } else {
        await merchantService.addSocialLink(resolvedParams.publicId, formData);
      }
      await loadLinks();
      closeModal();
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setError(err.data.errors[firstErrorKey][0]);
      } else {
        setError(err.message || "فشل في الحفظ");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm("هل أنت متأكد من حذف الرابط؟")) return;
    try {
      await merchantService.deleteSocialLink(resolvedParams.publicId, linkId);
      setLinks(links.filter(l => l.public_id !== linkId));
    } catch (err) {
      alert("فشل في الحذف");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">روابط التواصل الاجتماعي</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة رابط جديد
        </button>
      </div>

      {links.length === 0 ? (
        <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">لا توجد روابط مضافة</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            أضف روابط حساباتك على مواقع التواصل لتسهيل تواصل العملاء معك.
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F3D2E] text-white rounded-xl font-bold hover:bg-[#1E7D4E] transition-colors"
          >
            إضافة رابط
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map(link => {
            const platformName = PLATFORMS.find(p => p.id === link.platform)?.name || link.platform;
            return (
              <div key={link.public_id} className="bg-white dark:bg-[#171717] rounded-xl border border-[#EAF3EC] dark:border-[#1F2522] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-[#252525] rounded-lg flex items-center justify-center shrink-0">
                    <LinkIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] truncate">{platformName}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1E7D4E] hover:underline truncate block" dir="ltr">
                      {link.url}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openModal(link)} className="p-2 text-gray-500 hover:text-[#1E7D4E] hover:bg-gray-50 dark:hover:bg-[#252525] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(link.public_id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#171717] rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-[#EAF3EC] dark:border-[#1F2522]">
            <div className="flex items-center justify-between p-4 border-b border-[#EAF3EC] dark:border-[#1F2522]">
              <h3 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] text-lg">
                {editingId ? "تعديل الرابط" : "إضافة رابط جديد"}
              </h3>
              <button onClick={closeModal} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنصة</label>
                <select
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]"
                >
                  {PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرابط (URL)</label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  placeholder="https://"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-[#252525] dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 font-bold text-white bg-[#1E7D4E] hover:bg-[#0F3D2E] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
