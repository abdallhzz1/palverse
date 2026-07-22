"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StaticPage, CreatePageRequest } from "@/types/pages";
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
}

const emptyState: FormState = {
  slug: "",
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
};

export function PageForm({ initial, isSubmitting, apiError, onSubmit, submitLabel }: PageFormProps) {
  const [form, setForm] = useState<FormState>(emptyState);

  useEffect(() => {
    if (initial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        slug: initial.slug ?? "",
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
      });
    }
  }, [initial]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fieldError = (field: string): string | undefined => apiError?.details?.[field]?.[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreatePageRequest = {
      slug: form.slug.trim(),
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
    };
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8"
    >
      {/* Basic */}
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
              placeholder="about-us"
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldError("slug") && <p className="text-xs text-red-500">{fieldError("slug")}</p>}
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
            <Label htmlFor="title_ar">العنوان (عربي)</Label>
            <Input id="title_ar" value={form.title_ar} onChange={(e) => setField("title_ar", e.target.value)} disabled={isSubmitting} required className={fieldError("title_ar") ? "border-red-500" : ""} />
            {fieldError("title_ar") && <p className="text-xs text-red-500">{fieldError("title_ar")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_en">العنوان (إنجليزي)</Label>
            <Input id="title_en" dir="ltr" className="text-right" value={form.title_en} onChange={(e) => setField("title_en", e.target.value)} disabled={isSubmitting} />
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="excerpt_ar">المقتطف (عربي)</Label>
            <Textarea id="excerpt_ar" value={form.excerpt_ar} onChange={(e) => setField("excerpt_ar", e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="excerpt_en">المقتطف (إنجليزي)</Label>
            <Textarea id="excerpt_en" dir="ltr" className="text-left" value={form.excerpt_en} onChange={(e) => setField("excerpt_en", e.target.value)} disabled={isSubmitting} />
          </div>
        </div>
      </section>

      {/* SEO */}
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

      {/* Publishing */}
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
