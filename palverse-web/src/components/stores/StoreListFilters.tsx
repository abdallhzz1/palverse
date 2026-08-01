"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Tag, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { publicService } from "@/services/public.service";

interface StoreListFiltersProps {
  categories: Record<string, unknown>[];
  cities: Record<string, unknown>[];
}

export function StoreListFilters({ categories, cities }: StoreListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [zones, setZones] = useState<Record<string, unknown>[]>([]);

  const currentQuery = searchParams.get("query") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentCity = searchParams.get("city") || "";
  const currentZone = searchParams.get("zone") || "";

  useEffect(() => {
    if (!currentCity) {
      setZones([]);
      return;
    }
    publicService.getZones(currentCity).then((res) => {
      setZones(Array.isArray(res) ? res : (res as any)?.data || []);
    }).catch(() => setZones([]));
  }, [currentCity]);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/stores?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/stores");
    setIsMobileOpen(false);
  };

  const activeCount = [currentQuery, currentCategory, currentCity, currentZone].filter(Boolean).length;

  const filtersBody = (
    <>
      <div className="flex min-w-[180px] flex-1 items-center border-l border-[#E2EAE5] px-4 py-2">
        <Search className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
        <input
          type="text"
          placeholder="ابحث عن متجر، مطعم..."
          value={currentQuery}
          onChange={(e) => updateFilters({ query: e.target.value })}
          className="w-full border-none bg-transparent font-medium text-[#1A3D32] outline-none placeholder:text-[#6B8578]"
        />
      </div>

      <div className="flex min-w-[140px] flex-[0.7] items-center border-l border-[#E2EAE5] px-4 py-2">
        <MapPin className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
        <select
          value={currentCity}
          onChange={(e) => updateFilters({ city: e.target.value, zone: "" })}
          className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#1A3D32] outline-none"
        >
          <option value="">كل المدن</option>
          {cities.map((c: any) => (
            <option key={c.public_id} value={c.public_id}>{c.name_ar || c.name_en}</option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[140px] flex-[0.7] items-center border-l border-[#E2EAE5] px-4 py-2">
        <MapPin className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
        <select
          value={currentZone}
          disabled={!currentCity}
          onChange={(e) => updateFilters({ zone: e.target.value })}
          className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#1A3D32] outline-none disabled:opacity-50"
        >
          <option value="">كل الأحياء</option>
          {zones.map((z: any) => (
            <option key={z.public_id} value={z.public_id}>{z.name_ar || z.name_en}</option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[140px] flex-[0.7] items-center border-l border-[#E2EAE5] px-4 py-2">
        <Tag className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
        <select
          value={currentCategory}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#1A3D32] outline-none"
        >
          <option value="">كل الفئات</option>
          {categories.map((c: any) => (
            <option key={c.slug} value={c.slug}>{c.name_ar || c.name_en}</option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <>
      <div className="mx-auto mb-10 hidden w-full max-w-6xl flex-wrap items-center gap-2 rounded-xl border border-[#E2EAE5] bg-white p-2 lg:flex">
        {filtersBody}
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            مسح
          </button>
        )}
      </div>

      <div className="mb-8 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2EAE5] bg-white px-5 py-3 font-bold text-[#1A3D32]"
        >
          <SlidersHorizontal className="h-5 w-5 text-[#2F6B4F]" />
          <span>تصفية النتائج</span>
          {activeCount > 0 && (
            <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2F6B4F] text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-[#E2EAE5] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2EAE5] p-6">
              <h2 className="text-xl font-bold text-[#1A3D32]">تصفية النتائج</h2>
              <button onClick={() => setIsMobileOpen(false)} className="rounded-lg bg-[#F7F9F8] p-2 text-[#6B8578]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1A3D32]">كلمة البحث</label>
                <input
                  type="text"
                  value={currentQuery}
                  onChange={(e) => updateFilters({ query: e.target.value })}
                  className="w-full rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] px-4 py-3.5"
                  placeholder="ابحث عن متجر..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1A3D32]">المدينة</label>
                <select
                  value={currentCity}
                  onChange={(e) => updateFilters({ city: e.target.value, zone: "" })}
                  className="w-full rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] px-4 py-3.5"
                >
                  <option value="">كل المدن</option>
                  {cities.map((c: any) => (
                    <option key={c.public_id} value={c.public_id}>{c.name_ar || c.name_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1A3D32]">الحي / المنطقة</label>
                <select
                  value={currentZone}
                  disabled={!currentCity}
                  onChange={(e) => updateFilters({ zone: e.target.value })}
                  className="w-full rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] px-4 py-3.5 disabled:opacity-50"
                >
                  <option value="">كل الأحياء</option>
                  {zones.map((z: any) => (
                    <option key={z.public_id} value={z.public_id}>{z.name_ar || z.name_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1A3D32]">الفئة</label>
                <select
                  value={currentCategory}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] px-4 py-3.5"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((c: any) => (
                    <option key={c.slug} value={c.slug}>{c.name_ar || c.name_en}</option>
                  ))}
                </select>
              </div>
              {activeCount > 0 && (
                <button onClick={clearFilters} className="w-full rounded-xl bg-red-50 py-3 font-bold text-red-600">
                  مسح جميع الفلاتر
                </button>
              )}
            </div>

            <div className="border-t border-[#E2EAE5] p-6">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full rounded-xl bg-[#2F6B4F] py-4 font-bold text-white"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
