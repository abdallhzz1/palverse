"use client";

import { Search, MapPin } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  cities?: { public_id: string; name_ar: string; name_en: string }[];
}

export function SearchBar({ cities = [] }: SearchBarProps) {
  const dict = getDictionary("ar");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) params.set("query", query.trim());
    else params.delete("query");
    
    if (city) params.set("city", city);
    else params.delete("city");
    
    // Reset page to 1 when searching
    params.delete("page");

    router.push(`/stores?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full bg-white rounded-3xl sm:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden p-2 sm:p-1.5 md:p-2 gap-2 sm:gap-0">
      
      {/* Location Selector (Right side in RTL) */}
      <div className="flex-[0.4] flex items-center px-4 py-3 sm:py-2 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none border-none sm:border-solid sm:border-b-0 sm:border-l border-gray-200">
        <MapPin className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
        <select 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-[#0F3D2E] font-medium appearance-none cursor-pointer"
        >
          <option value="">{dict.common.allCities}</option>
          {cities.map((c) => (
            <option key={c.public_id} value={c.public_id}>{c.name_ar || c.name_en}</option>
          ))}
        </select>
      </div>

      {/* Search Input (Left side in RTL) */}
      <div className="flex-1 flex items-center px-4 py-3 sm:py-2 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
        <Search className="w-5 h-5 text-[#7FA789] ml-3 shrink-0" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مطعم، خدمة، أو اسم نشاط"
          className="w-full bg-transparent border-none outline-none text-[#0F3D2E] placeholder-[#7FA789] font-medium"
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="bg-[#0F3D2E] hover:bg-[#1E7D4E] text-white w-full sm:w-12 sm:h-12 md:w-14 md:h-14 py-3 sm:py-0 flex items-center justify-center rounded-2xl sm:rounded-full transition-colors shrink-0"
      >
        <Search className="w-5 h-5 md:w-6 md:h-6 sm:hidden ml-2" />
        <span className="sm:hidden font-bold">بحث</span>
        <Search className="hidden sm:block w-5 h-5 md:w-6 md:h-6" />
      </button>

    </form>
  );
}
