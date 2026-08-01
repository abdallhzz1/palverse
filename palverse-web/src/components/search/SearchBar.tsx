"use client";

import {
  Search,
  MapPin,
  Tag,
  Store,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { publicService, type SearchSuggestion } from "@/services/public.service";

interface SearchBarProps {
  cities?: { public_id: string; name_ar: string; name_en: string }[];
  categories?: { slug: string; name_ar: string; name_en: string }[];
  variant?: "default" | "onHero" | "home";
}

type ZoneOption = { public_id: string; name_ar: string; name_en: string };

function suggestionHref(item: SearchSuggestion): string | null {
  if (item.type === "store") {
    const slug = item.slug || item.public_id;
    return slug ? `/stores/${slug}` : null;
  }
  if (item.type === "category" && item.slug) {
    return `/stores?category=${encodeURIComponent(item.slug)}`;
  }
  if (item.type === "city" && item.public_id) {
    return `/stores?city=${encodeURIComponent(item.public_id)}`;
  }
  if (item.type === "zone" && item.public_id) {
    return `/stores?zone=${encodeURIComponent(item.public_id)}`;
  }
  return null;
}

function SuggestionIcon({ type }: { type: SearchSuggestion["type"] }) {
  if (type === "store") return <Store className="h-4 w-4" />;
  if (type === "category") return <Tag className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}

function typeLabel(type: SearchSuggestion["type"]) {
  if (type === "store") return "متجر";
  if (type === "category") return "فئة";
  if (type === "city") return "مدينة";
  return "منطقة";
}

export function SearchBar({ cities = [], categories = [] }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [zone, setZone] = useState(searchParams.get("zone") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (!city) {
      setZones([]);
      setZone("");
      return;
    }

    let cancelled = false;
    publicService
      .getZones(city)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res as { data?: ZoneOption[] })?.data || [];
        setZones(list);
        if (zone && !list.some((z) => z.public_id === zone)) {
          setZone("");
        }
      })
      .catch(() => {
        if (!cancelled) setZones([]);
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    let cancelled = false;
    setLoadingSuggestions(true);
    const timer = window.setTimeout(() => {
      publicService
        .getSearchSuggestions(q, 8)
        .then((items) => {
          if (!cancelled) setSuggestions(items);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingSuggestions(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectedCity = cities.find((c) => c.public_id === city);
  const selectedZone = zones.find((z) => z.public_id === zone);
  const selectedCategory = categories.find((c) => c.slug === category);

  const goToStores = (overrides?: {
    query?: string;
    city?: string;
    zone?: string;
    category?: string;
  }) => {
    const params = new URLSearchParams();
    const nextQuery = overrides?.query ?? query;
    const nextCity = overrides?.city ?? city;
    const nextZone = overrides?.zone ?? zone;
    const nextCategory = overrides?.category ?? category;

    if (nextQuery.trim()) params.set("query", nextQuery.trim());
    if (nextCity) params.set("city", nextCity);
    if (nextZone) params.set("zone", nextZone);
    if (nextCategory) params.set("category", nextCategory);

    setOpen(false);
    startTransition(() => {
      router.push(`/stores?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToStores();
  };

  const handleSuggestionClick = (item: SearchSuggestion) => {
    if (item.type === "store") {
      const href = suggestionHref(item);
      if (href) {
        setOpen(false);
        startTransition(() => router.push(href));
      }
      return;
    }

    if (item.type === "category" && item.slug) {
      setCategory(item.slug);
      goToStores({ category: item.slug, query: "" });
      return;
    }

    if (item.type === "city" && item.public_id) {
      setCity(item.public_id);
      setZone("");
      goToStores({ city: item.public_id, zone: "", query: "" });
      return;
    }

    if (item.type === "zone" && item.public_id) {
      setZone(item.public_id);
      goToStores({ zone: item.public_id, query: "" });
    }
  };

  const quickCategories = categories.slice(0, 8);
  const quickCities = cities.slice(0, 6);
  const showLiveSuggestions = query.trim().length >= 2;

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full max-w-2xl", open ? "z-50" : "z-10")}
    >      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border bg-white p-1.5 transition-shadow",
            open
              ? "border-[#2F6B4F]/40 shadow-[0_12px_40px_-20px_rgba(26,61,50,0.35)]"
              : "border-[#E2EAE5] shadow-sm"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
            <Search className="h-5 w-5 shrink-0 text-[#6B8578]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              placeholder="ابحث عن مطعم، خدمة، أو اسم نشاط"
              className="w-full border-none bg-transparent text-base font-medium text-[#1A3D32] outline-none placeholder:text-[#6B8578]"
              autoComplete="off"
              aria-expanded={open}
              aria-controls={panelId}
              aria-autocomplete="list"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                  setOpen(true);
                }}
                className="rounded-lg p-1 text-[#6B8578] transition-colors hover:bg-[#F7F9F8] hover:text-[#1A3D32]"
                aria-label="مسح البحث"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2F6B4F] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1A3D32] sm:px-5"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">بحث</span>
          </button>
        </div>
      </form>

      {(selectedCity || selectedZone || selectedCategory) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {selectedCity ? (
            <button
              type="button"
              onClick={() => {
                setCity("");
                setZone("");
                setOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2EAE5] bg-white px-3 py-1 text-xs font-bold text-[#1A3D32]"
            >
              <MapPin className="h-3.5 w-3.5 text-[#2F6B4F]" />
              {selectedCity.name_ar || selectedCity.name_en}
              <X className="h-3.5 w-3.5 text-[#6B8578]" />
            </button>
          ) : null}
          {selectedZone ? (
            <button
              type="button"
              onClick={() => {
                setZone("");
                setOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2EAE5] bg-white px-3 py-1 text-xs font-bold text-[#1A3D32]"
            >
              {selectedZone.name_ar || selectedZone.name_en}
              <X className="h-3.5 w-3.5 text-[#6B8578]" />
            </button>
          ) : null}
          {selectedCategory ? (
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2EAE5] bg-white px-3 py-1 text-xs font-bold text-[#1A3D32]"
            >
              <Tag className="h-3.5 w-3.5 text-[#2F6B4F]" />
              {selectedCategory.name_ar || selectedCategory.name_en}
              <X className="h-3.5 w-3.5 text-[#6B8578]" />
            </button>
          ) : null}
        </div>
      )}

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-[#E2EAE5] bg-white shadow-[0_20px_50px_-24px_rgba(26,61,50,0.45)]"
          role="listbox"
        >
          <div className="border-b border-[#E2EAE5] bg-[#F7F9F8] p-3">
            <p className="mb-2 text-[11px] font-bold tracking-wide text-[#6B8578]">ضيّق النتائج</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="relative flex items-center rounded-xl border border-[#E2EAE5] bg-white px-3 py-2">
                <MapPin className="ml-2 h-4 w-4 shrink-0 text-[#6B8578]" />
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setZone("");
                  }}
                  className="w-full cursor-pointer appearance-none border-none bg-transparent text-sm font-medium text-[#1A3D32] outline-none"
                >
                  <option value="">كل المدن</option>
                  {cities.map((c) => (
                    <option key={c.public_id} value={c.public_id}>
                      {c.name_ar || c.name_en}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 h-4 w-4 text-[#6B8578]" />
              </label>

              <label className="relative flex items-center rounded-xl border border-[#E2EAE5] bg-white px-3 py-2">
                <MapPin className="ml-2 h-4 w-4 shrink-0 text-[#6B8578]" />
                <select
                  value={zone}
                  disabled={!city || zones.length === 0}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full cursor-pointer appearance-none border-none bg-transparent text-sm font-medium text-[#1A3D32] outline-none disabled:opacity-50"
                >
                  <option value="">كل المناطق</option>
                  {zones.map((z) => (
                    <option key={z.public_id} value={z.public_id}>
                      {z.name_ar || z.name_en}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 h-4 w-4 text-[#6B8578]" />
              </label>

              <label className="relative flex items-center rounded-xl border border-[#E2EAE5] bg-white px-3 py-2">
                <Tag className="ml-2 h-4 w-4 shrink-0 text-[#6B8578]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full cursor-pointer appearance-none border-none bg-transparent text-sm font-medium text-[#1A3D32] outline-none"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name_ar || c.name_en}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 h-4 w-4 text-[#6B8578]" />
              </label>
            </div>
          </div>

          <div className="max-h-[min(22rem,55vh)] overflow-y-auto p-2">
            {showLiveSuggestions ? (
              <div>
                <div className="mb-1 flex items-center justify-between px-2 py-1.5">
                  <p className="text-[11px] font-bold tracking-wide text-[#6B8578]">اقتراحات</p>
                  {loadingSuggestions ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6B8578]" />
                  ) : null}
                </div>

                {suggestions.length > 0 ? (
                  <ul className="flex flex-col gap-0.5">
                    {suggestions.map((item, index) => {
                      const label = item.label_ar || item.label_en || "";
                      const secondary = item.secondary_label_ar || item.secondary_label_en;
                      return (
                        <li key={`${item.type}-${item.public_id || item.slug || index}`}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(item)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-[#F7F9F8]"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E2EAE5] bg-[#F7F9F8] text-[#2F6B4F]">
                              <SuggestionIcon type={item.type} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-bold text-[#1A3D32]">{label}</span>
                              <span className="block truncate text-xs text-[#6B8578]">
                                {typeLabel(item.type)}
                                {secondary ? ` · ${secondary}` : ""}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : !loadingSuggestions ? (
                  <p className="px-3 py-6 text-center text-sm text-[#6B8578]">
                    لا توجد اقتراحات مطابقة — يمكنك البحث مباشرة.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => goToStores()}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-[#E8EEEA]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2F6B4F] text-white">
                    <Search className="h-4 w-4" />
                  </span>
                  <span className="font-bold text-[#1A3D32]">
                    عرض كل النتائج لـ «{query.trim()}»
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 p-1">
                {quickCities.length > 0 ? (
                  <div>
                    <p className="mb-2 px-2 text-[11px] font-bold tracking-wide text-[#6B8578]">
                      مدن سريعة
                    </p>
                    <div className="flex flex-wrap gap-2 px-1">
                      {quickCities.map((c) => (
                        <button
                          key={c.public_id}
                          type="button"
                          onClick={() => {
                            setCity(c.public_id);
                            setZone("");
                          }}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                            city === c.public_id
                              ? "border-[#2F6B4F] bg-[#E8EEEA] text-[#2F6B4F]"
                              : "border-[#E2EAE5] bg-white text-[#1A3D32] hover:border-[#2F6B4F]/35"
                          )}
                        >
                          {c.name_ar || c.name_en}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {quickCategories.length > 0 ? (
                  <div>
                    <p className="mb-2 px-2 text-[11px] font-bold tracking-wide text-[#6B8578]">
                      فئات مقترحة
                    </p>
                    <div className="flex flex-wrap gap-2 px-1">
                      {quickCategories.map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => setCategory(c.slug)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                            category === c.slug
                              ? "border-[#2F6B4F] bg-[#E8EEEA] text-[#2F6B4F]"
                              : "border-[#E2EAE5] bg-white text-[#1A3D32] hover:border-[#2F6B4F]/35"
                          )}
                        >
                          {c.name_ar || c.name_en}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => goToStores()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F6B4F] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1A3D32]"
                >
                  <Search className="h-4 w-4" />
                  ابحث الآن
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
