"use client";

import { Search, MapPin, Tag } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { publicService } from "@/services/public.service";

interface SearchBarProps {
  cities?: { public_id: string; name_ar: string; name_en: string }[];
  categories?: { slug: string; name_ar: string; name_en: string }[];
  variant?: "default" | "onHero";
}

export function SearchBar({ cities = [], categories = [], variant = "default" }: SearchBarProps) {
  const dict = getDictionary("ar");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [zone, setZone] = useState(searchParams.get("zone") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [zones, setZones] = useState<{ public_id: string; name_ar: string; name_en: string }[]>([]);

  useEffect(() => {
    if (!city) {
      setZones([]);
      setZone("");
      return;
    }

    let cancelled = false;
    publicService.getZones(city).then((res) => {
      if (cancelled) return;
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setZones(list);
      if (zone && !list.some((z: any) => z.public_id === zone)) {
        setZone("");
      }
    }).catch(() => {
      if (!cancelled) setZones([]);
    });

    return () => {
      cancelled = true;
    };
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (query.trim()) params.set("query", query.trim());
    if (city) params.set("city", city);
    if (zone) params.set("zone", zone);
    if (category) params.set("category", category);

    router.push(`/stores?${params.toString()}`);
  };

  const onHero = variant === "onHero";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-2 overflow-hidden p-2 sm:p-1.5",
        onHero
          ? "rounded-2xl border border-white/25 bg-white/95 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md"
          : "rounded-2xl border border-[#EAF3EC] bg-white shadow-[0_8px_30px_-12px_rgba(15,61,46,0.12)]"
      )}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center rounded-xl bg-[#F5F7F6]/80 px-4 py-3">
          <MapPin className="ml-3 h-5 w-5 shrink-0 text-[#7FA789]" />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setZone("");
            }}
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

        <div className="flex items-center rounded-xl bg-[#F5F7F6]/80 px-4 py-3">
          <MapPin className="ml-3 h-5 w-5 shrink-0 text-[#7FA789]" />
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            disabled={!city || zones.length === 0}
            className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#0F3D2E] outline-none disabled:opacity-50"
          >
            <option value="">كل المناطق / الأحياء</option>
            {zones.map((z) => (
              <option key={z.public_id} value={z.public_id}>
                {z.name_ar || z.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-xl bg-[#F5F7F6]/80 px-4 py-3">
          <Tag className="ml-3 h-5 w-5 shrink-0 text-[#7FA789]" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#0F3D2E] outline-none"
          >
            <option value="">كل الفئات</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_ar || c.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-xl bg-[#F5F7F6]/80 px-4 py-3">
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#7FA789]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مطعم، خدمة، أو اسم نشاط"
            className="w-full border-none bg-transparent font-medium text-[#0F3D2E] outline-none placeholder:text-[#7FA789]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E7D4E] py-3 font-bold text-white transition-colors hover:bg-[#0F3D2E]"
      >
        <Search className="h-5 w-5" />
        بحث
      </button>
    </form>
  );
}
