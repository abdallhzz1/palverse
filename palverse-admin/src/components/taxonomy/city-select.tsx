"use client";

import { useCitiesList } from "@/hooks/use-cities";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CitySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
}

export function CitySelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "اختر المدينة",
  className = "",
  allowClear = false,
}: CitySelectProps) {
  const { data, isLoading, error } = useCitiesList({ page: 1, per_page: 100 }, false);

  if (error) {
    return (
      <select disabled className={cn("flex h-10 w-full items-center justify-between rounded-md border border-red-500 bg-card px-3 py-2 text-sm text-red-500", className)}>
        <option>فشل تحميل المدن</option>
      </select>
    );
  }

  return (
    <div className="relative">
      <select
        value={value || (allowClear ? "ALL" : "")}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "ALL" && allowClear) {
            onValueChange("");
          } else {
            onValueChange(val);
          }
        }}
        disabled={disabled || isLoading}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          className
        )}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {allowClear && (
          <option value="ALL">جميع المدن</option>
        )}
        {data?.data.map((city) => (
          <option key={city.public_id} value={city.public_id}>
            {city.name_ar} {city.name_en ? `(${city.name_en})` : ""}
          </option>
        ))}
        {data?.data.length === 0 && (
          <option disabled>لا توجد مدن متاحة</option>
        )}
      </select>
      {isLoading && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
