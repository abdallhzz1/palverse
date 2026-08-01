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
  variant?: "default" | "onHero" | "home";
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
  const isHome = variant === "home" || onHero;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-2 overflow-hidden p-2 sm:p-1.5",
        isHome
          ? "rounded-xl border border-[#E2EAE5] bg-white"
          : "rounded-xl border border-[#E2EAE5] bg-white"
      )}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center rounded-lg bg-[#F7F9F8] px-4 py-3">
          <MapPin className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setZone("");
            }}
            className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#1A3D32] outline-none"
          >
            <option value="">{dict.common.allCities}</option>
            {cities.map((c) => (
              <option key={c.public_id} value={c.public_id}>
                {c.name_ar || c.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-lg bg-[#F7F9F8] px-4 py-3">
          <MapPin className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            disabled={!city || zones.length === 0}
            className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#1A3D32] outline-none disabled:opacity-50"
          >
            <option value="">كل المناطق / الأحياء</option>
            {zones.map((z) => (
              <option key={z.public_id} value={z.public_id}>
                {z.name_ar || z.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-lg bg-[#F7F9F8] px-4 py-3">
          <Tag className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full cursor-pointer appearance-none border-none bg-transparent font-medium text-[#1A3D32] outline-none"
          >
            <option value="">كل الفئات</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_ar || c.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-lg bg-[#F7F9F8] px-4 py-3">
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#6B8578]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مطعم، خدمة، أو اسم نشاط"
            className="w-full border-none bg-transparent font-medium text-[#1A3D32] outline-none placeholder:text-[#6B8578]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2F6B4F] py-3.5 text-base font-bold text-white transition-colors hover:bg-[#1A3D32]"
      >
        <Search className="h-5 w-5" />
        بحث
      </button>
    </form>
  );
}
