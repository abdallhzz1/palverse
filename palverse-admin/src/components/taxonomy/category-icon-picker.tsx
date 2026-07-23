"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_ICON_CATALOG,
  CATEGORY_ICON_GROUPS,
  getCategoryIconOptionMeta,
  matchesCategoryIcon,
  type CategoryIconGroupId,
  type CategoryIconOption,
} from "@/lib/category-icons";
import {
  DEFAULT_CATEGORY_ICON,
  getLucideIconComponent,
  LucideIconByName,
  resolveLucideIconName,
} from "@/lib/lucide-icon";

interface CategoryIconPickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function CategoryIconPicker({ value, onChange, disabled }: CategoryIconPickerProps) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<CategoryIconGroupId | "all">("all");
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const deferredGroup = useDeferredValue(group);

  const selected = value ? resolveLucideIconName(value) : null;
  const selectedMeta = selected ? getCategoryIconOptionMeta(selected) : undefined;

  const filtered = useMemo(() => {
    let options: CategoryIconOption[] = CATEGORY_ICON_CATALOG;

    if (deferredGroup !== "all") {
      options = options.filter((item) => item.group === deferredGroup);
    }

    if (deferredQuery.trim()) {
      options = options.filter((item) => matchesCategoryIcon(item, deferredQuery));
    }

    // Keep a custom/legacy selection visible even if outside the curated set.
    if (
      selected &&
      !options.some((item) => item.name === selected) &&
      !CATEGORY_ICON_CATALOG.some((item) => item.name === selected)
    ) {
      options = [
        {
          name: selected,
          labelAr: "مخصص",
          keywords: [],
          group: "general",
        },
        ...options,
      ];
    } else if (
      selected &&
      deferredGroup === "all" &&
      !deferredQuery.trim() &&
      !options.some((item) => item.name === selected)
    ) {
      const meta = getCategoryIconOptionMeta(selected);
      if (meta) {
        options = [meta, ...options.filter((item) => item.name !== selected)];
      }
    }

    return options;
  }, [deferredGroup, deferredQuery, selected]);

  const handleSelect = (iconName: string) => {
    if (disabled) return;
    onChange(iconName === DEFAULT_CATEGORY_ICON ? null : iconName);
  };

  const handleQueryChange = (next: string) => {
    setQuery(next);
    startTransition(() => {
      setGroup("all");
    });
  };

  const handleGroupChange = (next: CategoryIconGroupId | "all") => {
    startTransition(() => {
      setGroup(next);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">أيقونة التصنيف</p>
          <p className="text-xs text-muted-foreground mt-1">
            اختياري — مجموعة مختارة لدليل الأعمال ({CATEGORY_ICON_CATALOG.length.toLocaleString("ar-PS")}{" "}
            أيقونة). ابحث بالعربي أو بالإنجليزي.
          </p>
        </div>
        {selected && (
          <div className="flex items-center gap-2 rounded-lg border border-[#1E7D4E]/30 bg-[#EAF3EC] px-3 py-2 text-sm text-[#0F3D2E]">
            <LucideIconByName name={selected} className="h-4 w-4" />
            <span className="text-xs font-medium">{selectedMeta?.labelAr || "مخصص"}</span>
            <span dir="ltr" className="font-mono text-[10px] text-[#0F3D2E]/70">
              {selected}
            </span>
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
          onChange={(e) => handleQueryChange(e.target.value)}
          disabled={disabled}
          placeholder="ابحث: مطعم، ملابس، سيارات، قهوة، shopping..."
          className="pr-9 pl-9"
          dir="auto"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleQueryChange("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="مسح البحث"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleGroupChange("all")}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs transition-colors",
            group === "all"
              ? "bg-[#1E7D4E] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          الكل
        </button>
        {CATEGORY_ICON_GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => handleGroupChange(item.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs transition-colors",
              group === item.id
                ? "bg-[#1E7D4E] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {item.labelAr}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "max-h-[360px] overflow-y-auto rounded-xl border bg-muted/20 p-3 transition-opacity",
          isPending && "opacity-70"
        )}
      >
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            لا توجد أيقونات مطابقة. جرّب كلمة أخرى مثل «مطعم» أو «هواتف».
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filtered.map((item) => {
              const Icon = getLucideIconComponent(item.name);
              const isActive = selected === item.name || (!selected && item.name === DEFAULT_CATEGORY_ICON);

              return (
                <button
                  key={item.name}
                  type="button"
                  title={`${item.labelAr} (${item.name})`}
                  disabled={disabled}
                  onClick={() => handleSelect(item.name)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-colors",
                    isActive
                      ? "border-[#1E7D4E] bg-[#EAF3EC] text-[#0F3D2E]"
                      : "border-transparent bg-background hover:border-[#1E7D4E]/40",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="w-full truncate text-[10px] leading-tight text-muted-foreground">
                    {item.labelAr}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length.toLocaleString("ar-PS")} أيقونة
        {deferredQuery.trim() || deferredGroup !== "all" ? " مطابقة" : " متاحة"}
      </p>
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
