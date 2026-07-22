"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Save, AlertCircle } from "lucide-react";
import { useStoreDetails, useStoreUpdate } from "@/hooks/use-store-details";
import { useCategoriesList } from "@/hooks/use-categories";
import { useCitiesList } from "@/hooks/use-cities";
import { useZonesList } from "@/hooks/use-zones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UpdateAdminStoreRequest } from "@/types/store";

interface StoreEditForm {
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address_ar: string;
  address_en: string;
  latitude: string;
  longitude: string;
  category_public_id: string;
  city_public_id: string;
  zone_public_id: string;
}

const emptyForm: StoreEditForm = {
  name_ar: "",
  name_en: "",
  description_ar: "",
  description_en: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  address_ar: "",
  address_en: "",
  latitude: "",
  longitude: "",
  category_public_id: "",
  city_public_id: "",
  zone_public_id: "",
};

const selectClasses =
  "flex h-10 w-full rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50";

export default function StoreEditPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();

  const { store, isLoading, error, refresh } = useStoreDetails(publicId);
  const { update, isSubmitting } = useStoreUpdate(publicId, () => {
    refresh();
    router.push(`/stores/${publicId}`);
  });

  const { data: categoriesData } = useCategoriesList({ page: 1, per_page: 100 });
  const { data: citiesData } = useCitiesList({ page: 1, per_page: 100 }, false);

  const [form, setForm] = useState<StoreEditForm>(emptyForm);

  // Zones depend on the selected city
  const { data: zonesData, setFilter: setZoneFilter } = useZonesList(
    { page: 1, per_page: 100 },
    false
  );

  useEffect(() => {
    if (form.city_public_id) {
      setZoneFilter("city", form.city_public_id);
    }
  }, [form.city_public_id, setZoneFilter]);

  useEffect(() => {
    if (store) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name_ar: store.name_ar ?? "",
        name_en: store.name_en ?? "",
        description_ar: store.description_ar ?? "",
        description_en: store.description_en ?? "",
        phone: store.phone ?? "",
        whatsapp: store.whatsapp ?? "",
        email: store.email ?? "",
        website: store.website ?? "",
        address_ar: store.address_ar ?? "",
        address_en: store.address_en ?? "",
        latitude: store.latitude != null ? String(store.latitude) : "",
        longitude: store.longitude != null ? String(store.longitude) : "",
        category_public_id: store.category?.public_id ?? "",
        city_public_id: store.city?.public_id ?? "",
        zone_public_id: store.zone?.public_id ?? "",
      });
    }
  }, [store]);

  const setField = <K extends keyof StoreEditForm>(key: K, value: StoreEditForm[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Reset zone when city changes
      if (key === "city_public_id") {
        next.zone_public_id = "";
      }
      return next;
    });
  };

  const zones = useMemo(() => zonesData?.data ?? [], [zonesData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UpdateAdminStoreRequest = {
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim() || null,
      description_ar: form.description_ar.trim(),
      description_en: form.description_en.trim() || null,
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      address_ar: form.address_ar.trim(),
      address_en: form.address_en.trim() || null,
      latitude: form.latitude.trim() === "" ? null : Number(form.latitude),
      longitude: form.longitude.trim() === "" ? null : Number(form.longitude),
    };

    if (form.category_public_id) payload.category_public_id = form.category_public_id;
    if (form.city_public_id) payload.city_public_id = form.city_public_id;
    if (form.zone_public_id) payload.zone_public_id = form.zone_public_id;

    await update(payload);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/stores"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة إلى المحلات
        </Link>
        <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-lg border border-red-200 dark:border-red-800 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-bold mb-2">لم يتم العثور على المحل</h3>
          <Button variant="outline" className="mt-4" onClick={refresh}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${publicId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">تعديل المحل</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{store.name_ar}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8"
      >
        {/* Basic info */}
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground dark:text-white pb-2 border-b border-border dark:border-slate-800">
            المعلومات الأساسية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">اسم المحل (عربي)</Label>
              <Input id="name_ar" value={form.name_ar} onChange={(e) => setField("name_ar", e.target.value)} disabled={isSubmitting} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">اسم المحل (إنجليزي)</Label>
              <Input id="name_en" dir="ltr" value={form.name_en} onChange={(e) => setField("name_en", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description_ar">الوصف (عربي)</Label>
              <Textarea id="description_ar" value={form.description_ar} onChange={(e) => setField("description_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description_en">الوصف (إنجليزي)</Label>
              <Textarea id="description_en" dir="ltr" value={form.description_en} onChange={(e) => setField("description_en", e.target.value)} disabled={isSubmitting} />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground dark:text-white pb-2 border-b border-border dark:border-slate-800">
            معلومات التواصل
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" dir="ltr" className="text-right" value={form.phone} onChange={(e) => setField("phone", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">رقم الواتساب</Label>
              <Input id="whatsapp" dir="ltr" className="text-right" value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" dir="ltr" className="text-right" value={form.email} onChange={(e) => setField("email", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">الموقع الإلكتروني</Label>
              <Input id="website" type="url" dir="ltr" className="text-right" placeholder="https://..." value={form.website} onChange={(e) => setField("website", e.target.value)} disabled={isSubmitting} />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground dark:text-white pb-2 border-b border-border dark:border-slate-800">
            الموقع والتصنيف
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_public_id">التصنيف</Label>
              <select
                id="category_public_id"
                className={selectClasses}
                value={form.category_public_id}
                onChange={(e) => setField("category_public_id", e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">بدون تصنيف</option>
                {categoriesData?.data.map((cat) => (
                  <option key={cat.public_id} value={cat.public_id}>
                    {cat.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city_public_id">المدينة</Label>
              <select
                id="city_public_id"
                className={selectClasses}
                value={form.city_public_id}
                onChange={(e) => setField("city_public_id", e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">بدون مدينة</option>
                {citiesData?.data.map((city) => (
                  <option key={city.public_id} value={city.public_id}>
                    {city.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone_public_id">المنطقة</Label>
              <select
                id="zone_public_id"
                className={selectClasses}
                value={form.zone_public_id}
                onChange={(e) => setField("zone_public_id", e.target.value)}
                disabled={isSubmitting || !form.city_public_id}
              >
                <option value="">بدون منطقة</option>
                {zones.map((zone) => (
                  <option key={zone.public_id} value={zone.public_id}>
                    {zone.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address_ar">العنوان التفصيلي (عربي)</Label>
              <Input id="address_ar" value={form.address_ar} onChange={(e) => setField("address_ar", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address_en">العنوان التفصيلي (إنجليزي)</Label>
              <Input id="address_en" dir="ltr" className="text-right" value={form.address_en} onChange={(e) => setField("address_en", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">خط العرض (Latitude)</Label>
              <Input id="latitude" type="number" step="any" dir="ltr" className="text-right" placeholder="31.9522" value={form.latitude} onChange={(e) => setField("latitude", e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">خط الطول (Longitude)</Label>
              <Input id="longitude" type="number" step="any" dir="ltr" className="text-right" placeholder="35.2332" value={form.longitude} onChange={(e) => setField("longitude", e.target.value)} disabled={isSubmitting} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            يجب إدخال خط العرض وخط الطول معاً أو تركهما فارغين معاً.
          </p>
        </section>

        <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-slate-800">
          <Button type="button" variant="outline" asChild disabled={isSubmitting}>
            <Link href={`/stores/${publicId}`}>إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </div>
      </form>
    </div>
  );
}
