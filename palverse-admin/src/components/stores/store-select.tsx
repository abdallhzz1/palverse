"use client";

import { useStoresList } from "@/hooks/use-stores";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
}

export function StoreSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "اختر المحل",
  className = "",
  allowClear = false,
}: StoreSelectProps) {
  // SyncUrl=false is important so it doesn't fight with main list URL params
  const { data, isLoading, error } = useStoresList({ page: 1, per_page: 100 }, false);

  if (error) {
    return (
      <select disabled className={cn("flex h-10 w-full items-center justify-between rounded-md border border-red-500 bg-white px-3 py-2 text-sm text-red-500", className)}>
        <option>فشل تحميل المحلات</option>
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
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          className
        )}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {allowClear && (
          <option value="ALL">جميع المحلات</option>
        )}
        {data?.data.map((store) => (
          <option key={store.public_id} value={store.public_id}>
            {store.name_ar} {store.name_en ? `(${store.name_en})` : ""}
          </option>
        ))}
        {data?.data.length === 0 && (
          <option disabled>لا توجد محلات متاحة</option>
        )}
      </select>
      {isLoading && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        </div>
      )}
    </div>
  );
}
