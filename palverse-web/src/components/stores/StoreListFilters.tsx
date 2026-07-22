"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Tag, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface StoreListFiltersProps {
  categories: Record<string, unknown>[];
  cities: Record<string, unknown>[];
}

export function StoreListFilters({ categories, cities }: StoreListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentQuery = searchParams.get("query") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // reset pagination
    router.push(`/stores?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/stores');
    setIsMobileOpen(false);
  };

  const activeCount = [currentQuery, currentCategory, currentCity].filter(Boolean).length;

  return (
    <>
      {/* Desktop Horizontal Filter Bar */}
      <div className="hidden lg:flex flex-wrap items-center gap-4 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-2 w-full max-w-5xl mx-auto mb-10">
        
        {/* Search Input */}
        <div className="flex-1 flex items-center px-4 py-2 border-l border-gray-100 min-w-[200px]">
          <Search className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
          <input 
            type="text" 
            placeholder="ابحث عن متجر، مطعم..."
            value={currentQuery}
            onChange={(e) => updateFilters("query", e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[#0F3D2E] placeholder-[#7FA789] font-medium"
          />
        </div>

        {/* City Filter */}
        <div className="flex-[0.8] flex items-center px-4 py-2 border-l border-gray-100 min-w-[150px]">
          <MapPin className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
          <select 
            value={currentCity}
            onChange={(e) => updateFilters("city", e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[#0F3D2E] font-medium appearance-none cursor-pointer"
          >
            <option value="">كل المناطق</option>
            {cities.map((c: any) => (
              <option key={c.public_id} value={c.public_id}>{c.name_ar || c.name_en}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex-[0.8] flex items-center px-4 py-2 border-l border-gray-100 min-w-[150px]">
          <Tag className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
          <select 
            value={currentCategory}
            onChange={(e) => updateFilters("category", e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[#0F3D2E] font-medium appearance-none cursor-pointer"
          >
            <option value="">كل الفئات</option>
            {categories.map((c: any) => (
              <option key={c.slug} value={c.slug}>{c.name_ar || c.name_en}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {activeCount > 0 && (
          <button 
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
          >
            مسح
          </button>
        )}
      </div>

      {/* Mobile Trigger */}
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

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0F3D2E]">تصفية النتائج</h2>
              <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-gray-50 rounded-full text-[#7FA789] hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {/* Search Query */}
              <div>
                <label className="block text-sm font-semibold text-[#0F3D2E] mb-2">كلمة البحث</label>
                <div className="relative">
                  <Search className="absolute right-4 top-3.5 w-5 h-5 text-[#7FA789]" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن متجر..."
                    value={currentQuery}
                    onChange={(e) => updateFilters("query", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-12 pl-4 py-3.5 text-[#0F3D2E] focus:outline-none focus:border-[#1E7D4E] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#0F3D2E] mb-2">المنطقة</label>
                <div className="relative">
                  <MapPin className="absolute right-4 top-3.5 w-5 h-5 text-[#7FA789]" />
                  <select 
                    value={currentCity}
                    onChange={(e) => updateFilters("city", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-12 pl-4 py-3.5 text-[#0F3D2E] focus:outline-none focus:border-[#1E7D4E] focus:bg-white transition-colors appearance-none"
                  >
                    <option value="">كل المناطق</option>
                    {cities.map((c: any) => (
                      <option key={c.public_id} value={c.public_id}>{c.name_ar || c.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#0F3D2E] mb-2">الفئة</label>
                <div className="relative">
                  <Tag className="absolute right-4 top-3.5 w-5 h-5 text-[#7FA789]" />
                  <select 
                    value={currentCategory}
                    onChange={(e) => updateFilters("category", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-12 pl-4 py-3.5 text-[#0F3D2E] focus:outline-none focus:border-[#1E7D4E] focus:bg-white transition-colors appearance-none"
                  >
                    <option value="">كل الفئات</option>
                    {categories.map((c: any) => (
                      <option key={c.slug} value={c.slug}>{c.name_ar || c.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
                >
                  مسح جميع الفلاتر
                </button>
              )}
            </div>

            <div className="p-6 border-t border-gray-100">
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="w-full bg-[#1E7D4E] text-white py-4 rounded-2xl font-bold hover:bg-[#0F3D2E] transition-colors shadow-sm"
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
