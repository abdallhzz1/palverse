"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StaticPage, CreatePageRequest, StaticPageMeta, StaticPageType } from "@/types/pages";
import { NormalizedApiError } from "@/lib/api/error";

interface PageFormProps {
  initial?: StaticPage | null;
  isSubmitting: boolean;
  apiError?: NormalizedApiError | null;
  onSubmit: (payload: CreatePageRequest) => void;
  submitLabel: string;
}

interface FormState {
  slug: string;
  page_type: StaticPageType;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  is_published: boolean;
  sort_order: string;
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  hero_eyebrow_ar: string;
  info_card_title_ar: string;
  phone: string;
  phone_label_ar: string;
  phone_hint_ar: string;
  email: string;
  email_label_ar: string;
  email_hint_ar: string;
  address_ar: string;
  address_line2_ar: string;
  address_label_ar: string;
  whatsapp_number: string;
  form_title_ar: string;
  submit_label_ar: string;
  map_lat: string;
  map_lng: string;
  map_embed_url: string;
}

const emptyState: FormState = {
  slug: "",
  page_type: "content",
  title_ar: "",
  title_en: "",
  content_ar: "",
  content_en: "",
  excerpt_ar: "",
  excerpt_en: "",
  is_published: false,
  sort_order: "",
  seo_title_ar: "",
  seo_title_en: "",
  seo_description_ar: "",
  seo_description_en: "",
  hero_eyebrow_ar: "",
  info_card_title_ar: "معلومات الاتصال",
  phone: "",
  phone_label_ar: "رقم الهاتف",
  phone_hint_ar: "",
  email: "",
  email_label_ar: "البريد الإلكتروني",
  email_hint_ar: "",
  address_ar: "",
  address_line2_ar: "",
  address_label_ar: "العنوان",
  whatsapp_number: "",
  form_title_ar: "أرسل لنا رسالة",
  submit_label_ar: "إرسال عبر واتساب",
  map_lat: "",
  map_lng: "",
  map_embed_url: "",
};

function metaFromForm(form: FormState): StaticPageMeta {
  const meta: StaticPageMeta = {
    hero_eyebrow_ar: form.hero_eyebrow_ar.trim() || null,
  };

  if (form.page_type === "contact") {
    Object.assign(meta, {
      info_card_title_ar: form.info_card_title_ar.trim() || null,
      phone: form.phone.trim() || null,
      phone_label_ar: form.phone_label_ar.trim() || null,
      phone_hint_ar: form.phone_hint_ar.trim() || null,
      email: form.email.trim() || null,
      email_label_ar: form.email_label_ar.trim() || null,
      email_hint_ar: form.email_hint_ar.trim() || null,
      address_ar: form.address_ar.trim() || null,
      address_line2_ar: form.address_line2_ar.trim() || null,
      address_label_ar: form.address_label_ar.trim() || null,
      whatsapp_number: form.whatsapp_number.trim() || null,
      form_title_ar: form.form_title_ar.trim() || null,
      submit_label_ar: form.submit_label_ar.trim() || null,
      map_lat: form.map_lat.trim() || null,
      map_lng: form.map_lng.trim() || null,
      map_embed_url: form.map_embed_url.trim() || null,
    });
  }

  return meta;
}

export function PageForm({ initial, isSubmitting, apiError, onSubmit, submitLabel }: PageFormProps) {
  const [form, setForm] = useState<FormState>(emptyState);

  useEffect(() => {
    if (initial) {
      const meta = initial.meta || {};
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        slug: initial.slug ?? "",
        page_type: initial.page_type === "contact" ? "contact" : "content",
        title_ar: initial.title_ar ?? "",
        title_en: initial.title_en ?? "",
        content_ar: initial.content_ar ?? "",
        content_en: initial.content_en ?? "",
        excerpt_ar: initial.excerpt_ar ?? "",
        excerpt_en: initial.excerpt_en ?? "",
        is_published: initial.is_published ?? false,
        sort_order: initial.sort_order != null ? String(initial.sort_order) : "",
        seo_title_ar: initial.seo_title_ar ?? "",
        seo_title_en: initial.seo_title_en ?? "",
        seo_description_ar: initial.seo_description_ar ?? "",
        seo_description_en: initial.seo_description_en ?? "",
        hero_eyebrow_ar: meta.hero_eyebrow_ar ?? "",
        info_card_title_ar: meta.info_card_title_ar ?? "معلومات الاتصال",
        phone: meta.phone ?? "",
        phone_label_ar: meta.phone_label_ar ?? "رقم الهاتف",
        phone_hint_ar: meta.phone_hint_ar ?? "",
        email: meta.email ?? "",
        email_label_ar: meta.email_label_ar ?? "البريد الإلكتروني",
        email_hint_ar: meta.email_hint_ar ?? "",
        address_ar: meta.address_ar ?? "",
        address_line2_ar: meta.address_line2_ar ?? "",
        address_label_ar: meta.address_label_ar ?? "العنوان",
        whatsapp_number: meta.whatsapp_number ?? "",
        form_title_ar: meta.form_title_ar ?? "أرسل لنا رسالة",
        submit_label_ar: meta.submit_label_ar ?? "إرسال عبر واتساب",
        map_lat: meta.map_lat ?? "",
        map_lng: meta.map_lng ?? "",
        map_embed_url: meta.map_embed_url ?? "",
      });
    }
  }, [initial]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fieldError = (field: string): string | undefined => apiError?.details?.[field]?.[0];

  const handleSlugChange = (value: string) => {
    setForm((prev) => {
      const next = { ...prev, slug: value };
      if (value === "contact" || value === "contact-us") {
        next.page_type = "contact";
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreatePageRequest = {
      slug: form.slug.trim(),
      page_type: form.page_type,
      title_ar: form.title_ar.trim(),
      title_en: form.title_en.trim() || null,
      content_ar: form.content_ar,
      content_en: form.content_en || null,
      excerpt_ar: form.excerpt_ar.trim() || null,
      excerpt_en: form.excerpt_en.trim() || null,
      is_published: form.is_published,
      sort_order: form.sort_order.trim() === "" ? null : parseInt(form.sort_order, 10),
      seo_title_ar: form.seo_title_ar.trim() || null,
      seo_title_en: form.seo_title_en.trim() || null,
      seo_description_ar: form.seo_description_ar.trim() || null,
      seo_description_en: form.seo_description_en.trim() || null,
      meta: metaFromForm(form),
    };
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8"
    >
      <section className="space-y-4">
        <h3 className="font-semibold text-foreground dark:text-white pb-2 border-b border-border dark:border-slate-800">
          محتوى الصفحة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">المعرّف (Slug)</Label>
            <Input
              id="slug"
              dir="ltr"
              className={`text-right ${fieldError("slug") ? "border-red-500" : ""}`}
              placeholder="about"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldError("slug") && <p className="text-xs text-red-500">{fieldError("slug")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_type">نوع الصفحة</Label>
            <select
              id="page_type"
              value={form.page_type}
              onChange={(e) => setField("page_type", e.target.value as StaticPageType)}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="content">محتوى تعريفي</option>
              <option value="contact">تواصل معنا</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">ترتيب العرض</Label>
            <Input
              id="sort_order"
              type="number"
              dir="ltr"
              className="text-right"
              min={0}
              value={form.sort_order}
              onChange={(e) => setField("sort_order", e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_eyebrow_ar">نص فوق العنوان (اختياري)</Label>
            <Input
              id="hero_eyebrow_ar"
              value={form.hero_eyebrow_ar}
              onChange={(e) => setField("hero_eyebrow_ar", e.target.value)}
              disabled={isSubmitting}
              placeholder="مثال: عن المنصة"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_ar">العنوان (عربي)</Label>
            <Input id="title_ar" value={form.title_ar} onChange={(e) => setField("title_ar", e.target.value)} disabled={isSubmitting} required className={fieldError("title_ar") ? "border-red-500" : ""} />
            {fieldError("title_ar") && <p className="text-xs text-red-500">{fieldError("title_ar")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_en">العنوان (إنجليزي)</Label>
            <Input id="title_en" dir="ltr" className="text-right" value={form.title_en} onChange={(e) => setField("title_en", e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="excerpt_ar">النص الداعم تحت العنوان (عربي)</Label>
            <Textarea id="excerpt_ar" value={form.excerpt_ar} onChange={(e) => setField("excerpt_ar", e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="excerpt_en">النص الداعم تحت العنوان (إنجليزي)</Label>
            <Textarea id="excerpt_en" dir="ltr" className="text-left" value={form.excerpt_en} onChange={(e) => setField("excerpt_en", e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="content_ar">المحتوى (عربي)</Label>
            <Textarea id="content_ar" className={`min-h-[180px] ${fieldError("content_ar") ? "border-red-500" : ""}`} value={form.content_ar} onChange={(e) => setField("content_ar", e.target.value)} disabled={isSubmitting} required />
            {fieldError("content_ar") && <p className="text-xs text-red-500">{fieldError("content_ar")}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="content_en">المحتوى (إنجليزي)</Label>
            <Textarea id="content_en" dir="ltr" className="min-h-[180px] text-left" value={form.content_en} onChange={(e) => setField("content_en", e.target.value)} disabled={isSubmitting} />
          </div>
        </div>
      </section>

      {form.page_type === "contact" && (
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground dark:text-white pb-2 border-b border-border dark:border-slate-800">
            معلومات التواصل (تظهر في صفحة تواصل معنا)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="info_card_title_ar">عنوان بطاقة المعلومات</Label>
              <Input id="info_card_title_ar" value={form.info_card_title_ar} onChange={(e) => setField("info_card_title_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_label_ar">تسمية الهاتف</Label>
              <Input id="phone_label_ar" value={form.phone_label_ar} onChange={(e) => setField("phone_label_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" dir="ltr" className="text-right" value={form.phone} onChange={(e) => setField("phone", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone_hint_ar">ملاحظة تحت الهاتف</Label>
              <Input id="phone_hint_ar" value={form.phone_hint_ar} onChange={(e) => setField("phone_hint_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_label_ar">تسمية البريد</Label>
              <Input id="email_label_ar" value={form.email_label_ar} onChange={(e) => setField("email_label_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" dir="ltr" className="text-right" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email_hint_ar">ملاحظة تحت البريد</Label>
              <Input id="email_hint_ar" value={form.email_hint_ar} onChange={(e) => setField("email_hint_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_label_ar">تسمية العنوان</Label>
              <Input id="address_label_ar" value={form.address_label_ar} onChange={(e) => setField("address_label_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_ar">العنوان</Label>
              <Input id="address_ar" value={form.address_ar} onChange={(e) => setField("address_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address_line2_ar">سطر عنوان إضافي</Label>
              <Input id="address_line2_ar" value={form.address_line2_ar} onChange={(e) => setField("address_line2_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">رقم واتساب (بدون +)</Label>
              <Input id="whatsapp_number" dir="ltr" className="text-right" placeholder="97259..." value={form.whatsapp_number} onChange={(e) => setField("whatsapp_number", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form_title_ar">عنوان النموذج</Label>
              <Input id="form_title_ar" value={form.form_title_ar} onChange={(e) => setField("form_title_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="submit_label_ar">نص زر الإرسال</Label>
              <Input id="submit_label_ar" value={form.submit_label_ar} onChange={(e) => setField("submit_label_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="map_lat">خط العرض (Latitude)</Label>
              <Input id="map_lat" dir="ltr" className="text-right" value={form.map_lat} onChange={(e) => setField("map_lat", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="map_lng">خط الطول (Longitude)</Label>
              <Input id="map_lng" dir="ltr" className="text-right" value={form.map_lng} onChange={(e) => setField("map_lng", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="map_embed_url">رابط خريطة مضمّن (اختياري بدل الإحداثيات)</Label>
              <Input id="map_embed_url" dir="ltr" className="text-right" value={form.map_embed_url} onChange={(e) => setField("map_embed_url", e.target.value)} disabled={isSubmitting} />
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="font-semibold text-foreground dark:text-white pb-2 border-b border-border dark:border-slate-800">
          تحسين محركات البحث (SEO)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seo_title_ar">عنوان SEO (عربي)</Label>
            <Input id="seo_title_ar" value={form.seo_title_ar} onChange={(e) => setField("seo_title_ar", e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_title_en">عنوان SEO (إنجليزي)</Label>
            <Input id="seo_title_en" dir="ltr" className="text-right" value={form.seo_title_en} onChange={(e) => setField("seo_title_en", e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seo_description_ar">وصف SEO (عربي)</Label>
            <Textarea id="seo_description_ar" value={form.seo_description_ar} onChange={(e) => setField("seo_description_ar", e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seo_description_en">وصف SEO (إنجليزي)</Label>
            <Textarea id="seo_description_en" dir="ltr" className="text-left" value={form.seo_description_en} onChange={(e) => setField("seo_description_en", e.target.value)} disabled={isSubmitting} />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between gap-4 pt-2">
        <div>
          <Label className="font-medium">نشر الصفحة</Label>
          <p className="text-xs text-muted-foreground mt-0.5">عند التفعيل تظهر الصفحة للعامة على الموقع.</p>
        </div>
        <Switch checked={form.is_published} onCheckedChange={(v) => setField("is_published", v)} disabled={isSubmitting} />
      </section>

      <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-slate-800">
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href="/pages">إلغاء</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white gap-2">
          <Save className="w-4 h-4" />
          {isSubmitting ? "جاري الحفظ..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
