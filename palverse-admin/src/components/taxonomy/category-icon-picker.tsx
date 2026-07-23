"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_CATEGORY_ICON,
  getLucideIconComponent,
  LUCIDE_ICON_NAMES,
  LucideIconByName,
  resolveLucideIconName,
} from "@/lib/lucide-icon";

const PAGE_SIZE = 120;

interface CategoryIconPickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function CategoryIconPicker({ value, onChange, disabled }: CategoryIconPickerProps) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const selected = value ? resolveLucideIconName(value) : null;

  const filteredNames = useMemo(() => {
    if (!deferredQuery) {
      return LUCIDE_ICON_NAMES;
    }

    return LUCIDE_ICON_NAMES.filter((name) => name.includes(deferredQuery));
  }, [deferredQuery]);

  const visibleNames = filteredNames.slice(0, visibleCount);

  const handleSelect = (iconName: string) => {
    if (disabled) return;
    onChange(iconName === DEFAULT_CATEGORY_ICON ? null : iconName);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">أيقونة التصنيف</p>
          <p className="text-xs text-muted-foreground mt-1">
            اختياري — اختر من مكتبة Lucide الكاملة ({LUCIDE_ICON_NAMES.length.toLocaleString("ar-PS")} أيقونة).
          </p>
        </div>
        {selected && (
          <div className="flex items-center gap-2 rounded-lg border border-[#1E7D4E]/30 bg-[#EAF3EC] px-3 py-2 text-sm text-[#0F3D2E]">
            <LucideIconByName name={selected} className="h-4 w-4" />
            <span dir="ltr" className="font-mono text-xs">{selected}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              className="rounded p-0.5 hover:bg-white/70"
              aria-label="مسح الأيقونة"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          disabled={disabled}
          placeholder="ابحث باسم الأيقونة... مثل utensils أو shopping-bag"
          className="pr-9"
          dir="ltr"
        />
      </div>

      <div className="max-h-[360px] overflow-y-auto rounded-xl border bg-muted/20 p-3">
        {visibleNames.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">لا توجد أيقونات مطابقة للبحث.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {visibleNames.map((iconName) => {
              const Icon = getLucideIconComponent(iconName);
              const isActive = selected === iconName || (!selected && iconName === DEFAULT_CATEGORY_ICON);

              return (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  disabled={disabled}
                  onClick={() => handleSelect(iconName)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors",
                    isActive
                      ? "border-[#1E7D4E] bg-[#EAF3EC] text-[#0F3D2E]"
                      : "border-transparent bg-background hover:border-[#1E7D4E]/40",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span dir="ltr" className="w-full truncate text-[9px] leading-tight text-muted-foreground">
                    {iconName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          عرض {Math.min(visibleCount, filteredNames.length).toLocaleString("ar-PS")} من{" "}
          {filteredNames.length.toLocaleString("ar-PS")}
        </span>
        {visibleCount < filteredNames.length && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="font-medium text-[#1E7D4E] hover:underline"
          >
            عرض المزيد
          </button>
        )}
      </div>
    </div>
  );
}

/** @deprecated Prefer LucideIconByName / getLucideIconComponent */
export function getCategoryIconOption(icon?: string | null) {
  const value = resolveLucideIconName(icon);
  return {
    value,
    label: value,
    Icon: getLucideIconComponent(value),
  };
}
