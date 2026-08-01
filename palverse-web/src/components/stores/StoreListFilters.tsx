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
      <div className="flex-1 flex items-center px-4 py-2 border-l border-gray-100 min-w-[180px]">
        <Search className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
        <input
          type="text"
          placeholder="ابحث عن متجر، مطعم..."
          value={currentQuery}
          onChange={(e) => updateFilters({ query: e.target.value })}
          className="w-full bg-transparent border-none outline-none text-[#0F3D2E] placeholder-[#7FA789] font-medium"
        />
      </div>

      <div className="flex-[0.7] flex items-center px-4 py-2 border-l border-gray-100 min-w-[140px]">
        <MapPin className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
        <select
          value={currentCity}
          onChange={(e) => updateFilters({ city: e.target.value, zone: "" })}
          className="w-full bg-transparent border-none outline-none text-[#0F3D2E] font-medium appearance-none cursor-pointer"
        >
          <option value="">كل المدن</option>
          {cities.map((c: any) => (
            <option key={c.public_id} value={c.public_id}>{c.name_ar || c.name_en}</option>
          ))}
        </select>
      </div>

      <div className="flex-[0.7] flex items-center px-4 py-2 border-l border-gray-100 min-w-[140px]">
        <MapPin className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
        <select
          value={currentZone}
          disabled={!currentCity}
          onChange={(e) => updateFilters({ zone: e.target.value })}
          className="w-full bg-transparent border-none outline-none text-[#0F3D2E] font-medium appearance-none cursor-pointer disabled:opacity-50"
        >
          <option value="">كل الأحياء</option>
          {zones.map((z: any) => (
            <option key={z.public_id} value={z.public_id}>{z.name_ar || z.name_en}</option>
          ))}
        </select>
      </div>

      <div className="flex-[0.7] flex items-center px-4 py-2 border-l border-gray-100 min-w-[140px]">
        <Tag className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
        <select
          value={currentCategory}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="w-full bg-transparent border-none outline-none text-[#0F3D2E] font-medium appearance-none cursor-pointer"
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
      <div className="hidden lg:flex flex-wrap items-center gap-2 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-2 w-full max-w-6xl mx-auto mb-10">
        {filtersBody}
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
          >
            مسح
          </button>
        )}
      </div>

      <div className="lg:hidden mb-8 flex items-center justify-between">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl text-[#0F3D2E] shadow-sm font-bold w-full justify-center"
        >
          <SlidersHorizontal className="w-5 h-5 text-[#1E7D4E]" />
          <span>تصفية النتائج</span>
          {activeCount > 0 && (
            <span className="bg-[#1E7D4E] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs ml-2">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0F3D2E]">تصفية النتائج</h2>
              <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-gray-50 rounded-full text-[#7FA789]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#0F3D2E] mb-2">كلمة البحث</label>
                <input
                  type="text"
                  value={currentQuery}
                  onChange={(e) => updateFilters({ query: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5"
                  placeholder="ابحث عن متجر..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F3D2E] mb-2">المدينة</label>
                <select
                  value={currentCity}
                  onChange={(e) => updateFilters({ city: e.target.value, zone: "" })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5"
                >
                  <option value="">كل المدن</option>
                  {cities.map((c: any) => (
                    <option key={c.public_id} value={c.public_id}>{c.name_ar || c.name_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F3D2E] mb-2">الحي / المنطقة</label>
                <select
                  value={currentZone}
                  disabled={!currentCity}
                  onChange={(e) => updateFilters({ zone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 disabled:opacity-50"
                >
                  <option value="">كل الأحياء</option>
                  {zones.map((z: any) => (
                    <option key={z.public_id} value={z.public_id}>{z.name_ar || z.name_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F3D2E] mb-2">الفئة</label>
                <select
                  value={currentCategory}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((c: any) => (
                    <option key={c.slug} value={c.slug}>{c.name_ar || c.name_en}</option>
                  ))}
                </select>
              </div>
              {activeCount > 0 && (
                <button onClick={clearFilters} className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold">
                  مسح جميع الفلاتر
                </button>
              )}
            </div>

            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full bg-[#1E7D4E] text-white py-4 rounded-2xl font-bold"
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
