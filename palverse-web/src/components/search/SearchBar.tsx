"use client";

import { Search, MapPin } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  cities?: { public_id: string; name_ar: string; name_en: string }[];
  variant?: "default" | "onHero";
}

export function SearchBar({ cities = [], variant = "default" }: SearchBarProps) {
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

    params.delete("page");

    router.push(`/stores?${params.toString()}`);
  };

  const onHero = variant === "onHero";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-2 overflow-hidden p-2 sm:flex-row sm:items-stretch sm:gap-0 sm:p-1.5",
        onHero
          ? "rounded-2xl border border-white/25 bg-white/95 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md sm:rounded-full"
          : "rounded-2xl border border-[#EAF3EC] bg-white shadow-[0_8px_30px_-12px_rgba(15,61,46,0.12)] sm:rounded-full"
      )}
    >
      <div className="flex flex-[0.4] items-center rounded-xl border-none bg-[#F5F7F6]/80 px-4 py-3 sm:rounded-none sm:border-l sm:border-[#EAF3EC] sm:bg-transparent sm:py-2">
        <MapPin className="ml-3 h-5 w-5 shrink-0 text-[#7FA789]" />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#0F3D2E] outline-none"
        >
          <option value="">{dict.common.allCities}</option>
          {cities.map((c) => (
            <option key={c.public_id} value={c.public_id}>
              {c.name_ar || c.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 items-center rounded-xl bg-[#F5F7F6]/80 px-4 py-3 sm:rounded-none sm:bg-transparent sm:py-2">
        <Search className="ml-3 h-5 w-5 shrink-0 text-[#7FA789]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مطعم، خدمة، أو اسم نشاط"
          className="w-full border-none bg-transparent font-medium text-[#0F3D2E] outline-none placeholder:text-[#7FA789]"
        />
      </div>

      <button
        type="submit"
        className="flex w-full shrink-0 items-center justify-center rounded-xl bg-[#1E7D4E] py-3 text-white transition-colors hover:bg-[#0F3D2E] sm:h-12 sm:w-12 sm:rounded-full sm:py-0 md:h-14 md:w-14"
      >
        <Search className="ml-2 h-5 w-5 sm:ml-0 md:h-6 md:w-6" />
        <span className="font-bold sm:hidden">بحث</span>
      </button>
    </form>
  );
}
