"use client";

import {
  Apple,
  BookOpen,
  Car,
  Coffee,
  Gift,
  Grid,
  HeartPulse,
  Home,
  Scissors,
  ShoppingBag,
  Smartphone,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const CATEGORY_ICON_OPTIONS = [
  { value: "grid", label: "افتراضي", Icon: Grid },
  { value: "restaurant", label: "مطاعم", Icon: Utensils },
  { value: "cafe", label: "مقاهي وحلويات", Icon: Coffee },
  { value: "shopping", label: "تسوق وأزياء", Icon: ShoppingBag },
  { value: "tech", label: "إلكترونيات", Icon: Smartphone },
  { value: "home", label: "أثاث ومنزل", Icon: Home },
  { value: "services", label: "خدمات", Icon: Wrench },
  { value: "health", label: "صحة وتجميل", Icon: HeartPulse },
  { value: "education", label: "تعليم وتدريب", Icon: BookOpen },
  { value: "automotive", label: "سيارات", Icon: Car },
  { value: "groceries", label: "بقالة", Icon: Apple },
  { value: "gifts", label: "هدايا وزهور", Icon: Gift },
  { value: "crafts", label: "حرف محلية", Icon: Scissors },
] as const;

export type CategoryIconValue = (typeof CATEGORY_ICON_OPTIONS)[number]["value"];

export function getCategoryIconOption(icon?: string | null): {
  value: string;
  label: string;
  Icon: LucideIcon;
} {
  return (
    CATEGORY_ICON_OPTIONS.find((option) => option.value === icon) ||
    CATEGORY_ICON_OPTIONS[0]
  );
}

interface CategoryIconPickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function CategoryIconPicker({ value, onChange, disabled }: CategoryIconPickerProps) {
  const selected = value || null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">أيقونة التصنيف</p>
        <p className="text-xs text-muted-foreground mt-1">
          اختياري — تظهر الأيقونة في الموقع العام وصفحة التصنيفات.
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {CATEGORY_ICON_OPTIONS.map(({ value: iconValue, label, Icon }) => {
          const isActive = selected === iconValue || (!selected && iconValue === "grid");
          return (
            <button
              key={iconValue}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iconValue === "grid" ? null : iconValue)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors",
                isActive
                  ? "border-[#1E7D4E] bg-[#EAF3EC] text-[#0F3D2E]"
                  : "border-border bg-background hover:border-[#1E7D4E]/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] leading-tight font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
