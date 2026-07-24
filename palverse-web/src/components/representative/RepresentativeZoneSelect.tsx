"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { RepresentativeZone } from "@/types/representative";

interface RepresentativeZoneSelectProps {
  zones: RepresentativeZone[];
  value: string;
  onChange: (zonePublicId: string, cityPublicId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function RepresentativeZoneSelect({
  zones,
  value,
  onChange,
  disabled = false,
  placeholder = "-- اختر المنطقة المخصصة --",
}: RepresentativeZoneSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const sortedZones = useMemo(
    () =>
      [...zones].sort((a, b) =>
        a.zone.name_ar.localeCompare(b.zone.name_ar, "ar")
      ),
    [zones]
  );

  const filteredZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedZones;
    return sortedZones.filter((item) => {
      const haystack = [
        item.zone.name_ar,
        item.zone.name_en ?? "",
        item.zone.city.name_ar,
        item.zone.city.name_en ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [sortedZones, query]);

  const selected = zones.find((item) => item.zone.public_id === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-right text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-[#252525] dark:text-gray-100"
      >
        <span className={selected ? "" : "text-gray-500"}>
          {selected
            ? `${selected.zone.name_ar} (${selected.zone.city.name_ar})`
            : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#1A1A1A]">
          <div className="border-b border-gray-100 p-2 dark:border-gray-800">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منطقة..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] dark:border-gray-700 dark:bg-[#252525]"
              />
            </div>
            <p className="mt-2 px-1 text-xs text-gray-500">
              {filteredZones.length} من {zones.length} منطقة مخصصة
            </p>
          </div>

          <ul className="max-h-60 overflow-y-auto overscroll-contain py-1">
            {filteredZones.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">لا توجد نتائج</li>
            ) : (
              filteredZones.map((item) => {
                const isSelected = item.zone.public_id === value;
                return (
                  <li key={item.public_id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-right text-sm hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/40 ${
                        isSelected ? "bg-[#EAF3EC]/70 text-[#0F3D2E] dark:bg-[#0F3D2E]/30 dark:text-[#EAF3EC]" : ""
                      }`}
                      onClick={() => {
                        onChange(item.zone.public_id, item.zone.city.public_id);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span>
                        {item.zone.name_ar}{" "}
                        <span className="text-gray-500">({item.zone.city.name_ar})</span>
                      </span>
                      {isSelected ? <Check className="h-4 w-4 text-[#1E7D4E]" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
