"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Send, AlertTriangle, Upload, Trash2, Plus, ImageIcon, Camera } from "lucide-react";
import LocationPicker from "@/components/map/LocationPicker";
import { RepresentativeZoneSelect } from "@/components/representative/RepresentativeZoneSelect";
import {
  StoreRequestExtrasSections,
  type SocialLinkDraft,
  type WorkingHoursDraft,
} from "@/components/representative/StoreRequestExtrasSections";
import { RepresentativeService } from "@/services/representative.service";
import { publicService } from "@/services/public.service";
import type { RepresentativeZone, StoreRegistrationRequest } from "@/types/representative";

export default function EditStoreRequestPage() {
  const router = useRouter();
  const params = useParams();
  const [zones, setZones] = useState<RepresentativeZone[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [draftMedia, setDraftMedia] = useState<StoreRegistrationRequest["draft_media"]>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    zone_public_id: "",
    city_public_id: "", // Will be derived from selected zone
    category_public_id: "",
    latitude: null as number | null,
    longitude: null as number | null,
    proposed_merchant_name: "",
    proposed_merchant_phone: "",
    proposed_merchant_email: "",
    store_name_ar: "",
    store_name_en: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address_ar: "",
    description_ar: "",
    description_en: "",
  });
  const [workingHours, setWorkingHours] = useState<WorkingHoursDraft | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinkDraft[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, categoriesRes, requestRes] = await Promise.all([
          RepresentativeService.getZones(),
          publicService.getCategories(),
          RepresentativeService.getStoreRequest(params.publicId as string)
        ]);
        setZones(zonesRes.data);
        
        const cats = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []);
        setCategories(cats);

        const req = requestRes.data;
        setFormData({
          zone_public_id: req.zone?.public_id || "",
          city_public_id: req.city?.public_id || "",
          category_public_id: req.category?.public_id || "",
          latitude: req.latitude || null,
          longitude: req.longitude || null,
          proposed_merchant_name: req.proposed_merchant_name || "",
          proposed_merchant_phone: req.proposed_merchant_phone || "",
          proposed_merchant_email: req.proposed_merchant_email || "",
          store_name_ar: req.store_name_ar || "",
          store_name_en: req.store_name_en || "",
          phone: req.phone || "",
          whatsapp: req.whatsapp || "",
          email: (req as any).email || "",
          website: (req as any).website || "",
          address_ar: req.address_ar || "",
          description_ar: req.description_ar || "",
          description_en: req.description_en || "",
        });
        setWorkingHours(req.working_hours || null);
        setSocialLinks(
          (req.social_links || []).map((link) => ({
            platform: link.platform,
            url: link.url,
            username: link.username || "",
          }))
        );
        setDraftMedia(req.draft_media || null);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchData();
  }, [params.publicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleZoneChange = (zonePublicId: string, cityPublicId: string) => {
    setFormData((prev) => ({
      ...prev,
      zone_public_id: zonePublicId,
      city_public_id: cityPublicId,
    }));
  };

  const buildPayload = () => {
    const payload = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, v === "" ? null : v])
    ) as Record<string, unknown>;

    payload.working_hours = workingHours;

    const cleanedSocials = socialLinks.filter((l) => l.url.trim());
    payload.social_links = cleanedSocials.length > 0 ? cleanedSocials : null;

    return payload;
  };

  const handleSaveDraft = async () => {
    setError(null);    
    setFieldErrors({});
    try {
      setIsLoading(true);
      setError(null);
      const payload = buildPayload();
      await RepresentativeService.updateStoreRequest(params.publicId as string, payload as any);
      await RepresentativeService.submitStoreRequest(params.publicId as string);
      router.push("/representative/store-requests");
    } catch (err: any) {
      const errorData = err.data || err.response?.data;
      if (errorData?.errors) {
        setFieldErrors(errorData.errors);
        setError("يرجى تصحيح الأخطاء في النموذج");
      } else {
        setError(errorData?.message || "حدث خطأ أثناء حفظ التحديثات");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    setMediaError(null);
    setUploadingMedia("logo");
    try {
      const res = await RepresentativeService.uploadRequestLogo(params.publicId as string, file);
      setDraftMedia(res.data.draft_media || null);
    } catch (err: any) {
      setMediaError(err.data?.message || err.response?.data?.message || "حدث خطأ أثناء رفع الشعار");
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm("هل أنت متأكد من حذف الشعار؟")) return;
    setMediaError(null);
    try {
      const res = await RepresentativeService.deleteRequestLogo(params.publicId as string);
      setDraftMedia(res.data.draft_media || null);
    } catch (err: any) {
      setMediaError(err.data?.message || err.response?.data?.message || "حدث خطأ أثناء حذف الشعار");
    }
  };

  const handleUploadCover = async (file: File) => {
    setMediaError(null);
    setUploadingMedia("cover");
    try {
      const res = await RepresentativeService.uploadRequestCover(params.publicId as string, file);
      setDraftMedia(res.data.draft_media || null);
    } catch (err: any) {
      setMediaError(err.data?.message || err.response?.data?.message || "حدث خطأ أثناء رفع الغلاف");
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleDeleteCover = async () => {
    if (!confirm("هل أنت متأكد من حذف الغلاف؟")) return;
    setMediaError(null);
    try {
      const res = await RepresentativeService.deleteRequestCover(params.publicId as string);
      setDraftMedia(res.data.draft_media || null);
    } catch (err: any) {
      setMediaError(err.data?.message || err.response?.data?.message || "حدث خطأ أثناء حذف الغلاف");
    }
  };

  const handleUploadGallery = async (files: File[]) => {
    if (files.length === 0) return;
    setMediaError(null);
    setUploadingMedia("gallery");
    try {
      const res = await RepresentativeService.uploadRequestGallery(params.publicId as string, files);
      setDraftMedia(res.data.draft_media || null);
    } catch (err: any) {
      setMediaError(err.data?.message || err.response?.data?.message || "حدث خطأ أثناء رفع الصور");
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleDeleteGalleryItem = async (pathHash: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    setMediaError(null);
    try {
      const res = await RepresentativeService.deleteRequestGalleryItem(params.publicId as string, pathHash);
      setDraftMedia(res.data.draft_media || null);
    } catch (err: any) {
      setMediaError(err.data?.message || err.response?.data?.message || "حدث خطأ أثناء حذف الصورة");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-[#171717] p-6 rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522]">
          <div>
            <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تعديل طلب تسجيل متجر</h1>
            <p className="text-[#1E7D4E] dark:text-[#4ADE80] mt-1">تحديث بيانات المتجر وإعادة إرساله للمراجعة</p>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSaveDraft}
            className="flex items-center gap-2 bg-[#1E7D4E] hover:bg-[#165c39] text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "جاري الإرسال..." : "تحديث وإرسال"}
            <Send className="w-4 h-4" />
          </button>
        </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{error}</p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="list-disc list-inside mt-2 text-sm">
                {Object.entries(fieldErrors).map(([field, msgs]) => (
                  <li key={field}>{msgs[0]}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-visible">
        <div className="p-6 space-y-8">
          
          {/* Section 1: Merchant Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">
              بيانات التاجر المقترح
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم التاجر المقترح *</label>
                <input
                  type="text"
                  name="proposed_merchant_name"
                  value={formData.proposed_merchant_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم جوال التاجر *</label>
                <input
                  type="tel"
                  name="proposed_merchant_phone"
                  value={formData.proposed_merchant_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني للتاجر (اختياري)</label>
                <input
                  type="email"
                  name="proposed_merchant_email"
                  value={formData.proposed_merchant_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Store Details */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">
              بيانات المتجر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم المحل المقترح *</label>
                <input
                  type="text"
                  name="store_name_ar"
                  value={formData.store_name_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم المحل بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  name="store_name_en"
                  value={formData.store_name_en}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم الهاتف *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم الواتساب (اختياري)</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع الإلكتروني (اختياري)</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">المنطقة الجغرافية *</label>
                <RepresentativeZoneSelect
                  zones={zones}
                  value={formData.zone_public_id}
                  onChange={handleZoneChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">تظهر هنا فقط المناطق المخصصة لك. استخدم البحث أو مرّر داخل القائمة لعرض الباقي.</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">التصنيف (اختياري)</label>
                <select
                  name="category_public_id"
                  value={formData.category_public_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                >
                  <option value="">-- اختر التصنيف --</option>
                  {categories.map((c) => (
                    <option key={c.public_id} value={c.public_id}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">العنوان بالتفصيل *</label>
                <input
                  type="text"
                  name="address_ar"
                  value={formData.address_ar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع على الخريطة</label>
                <LocationPicker 
                  latitude={formData.latitude} 
                  longitude={formData.longitude} 
                  onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">وصف موجز للمتجر (عربي) (اختياري)</label>
                <textarea
                  name="description_ar"
                  value={formData.description_ar}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">وصف موجز للمتجر (إنجليزي) (اختياري)</label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#252525] focus:ring-2 focus:ring-[#1E7D4E]"
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          <StoreRequestExtrasSections
            workingHours={workingHours}
            onWorkingHoursChange={setWorkingHours}
            socialLinks={socialLinks}
            onSocialLinksChange={setSocialLinks}
            disabled={isLoading}
          />

          {/* Section 3: Media */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">
              وسائط المتجر (اختياري)
            </h2>

            {mediaError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {mediaError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">شعار المحل</h3>
                  {draftMedia?.logo?.url && (
                    <button
                      type="button"
                      onClick={handleDeleteLogo}
                      disabled={isLoading || uploadingMedia === "logo"}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-28 h-28 relative rounded-full border-4 border-gray-100 dark:border-gray-800 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-[#252525]">
                    {draftMedia?.logo?.url ? (
                      <Image src={draftMedia.logo.url} alt="شعار المحل" fill unoptimized className="object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    {uploadingMedia === "logo" ? "جاري الرفع..." : "رفع/تغيير الشعار"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={isLoading || uploadingMedia !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleUploadLogo(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Cover */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">صورة الغلاف</h3>
                  {draftMedia?.cover?.url && (
                    <button
                      type="button"
                      onClick={handleDeleteCover}
                      disabled={isLoading || uploadingMedia === "cover"}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-28 w-full relative rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-[#252525]">
                    {draftMedia?.cover?.url ? (
                      <Image src={draftMedia.cover.url} alt="صورة الغلاف" fill unoptimized className="object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors text-sm w-max mx-auto">
                    <Upload className="w-4 h-4" />
                    {uploadingMedia === "cover" ? "جاري الرفع..." : "رفع/تغيير الغلاف"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={isLoading || uploadingMedia !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleUploadCover(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">معرض الصور</h3>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  {uploadingMedia === "gallery" ? "جاري الرفع..." : "إضافة صور"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    disabled={isLoading || uploadingMedia !== null}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      e.target.value = "";
                      if (files.length > 0) handleUploadGallery(files);
                    }}
                  />
                </label>
              </div>

              {!draftMedia?.gallery || draftMedia.gallery.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">لا توجد صور في المعرض</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {draftMedia.gallery.map((img, idx) => (
                    <div key={img.path_hash || idx} className="relative aspect-square rounded-xl overflow-hidden group">
                      {img.url && (
                        <Image src={img.url} alt="صورة من المعرض" fill unoptimized className="object-cover" />
                      )}
                      {img.path_hash && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryItem(img.path_hash!)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
        <div className="p-6 bg-gray-50 dark:bg-[#1A1A1A] border-t border-[#EAF3EC] dark:border-[#1F2522] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isLoading || !formData.proposed_merchant_name || !formData.store_name_ar || !formData.zone_public_id}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ كمسودة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
