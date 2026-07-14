"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminStore } from "@/types/store";
import { useStoresList } from "@/hooks/use-stores";

interface StoreSelectorProps {
  value?: string;
  onSelect: (publicId: string, store: AdminStore | undefined) => void;
  disabled?: boolean;
}

export function StoreSelector({ value, onSelect, disabled }: StoreSelectorProps) {
  const [search, setSearch] = useState("");
  
  // We use syncUrl=false so this internal search doesn't mess up the main page URL
  const { data, isLoading, setFilter } = useStoresList({ per_page: 50 }, false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter("query", search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, setFilter]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const store = data?.data.find((s) => s.public_id === selectedId);
    onSelect(selectedId, store);
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="بحث باسم المحل..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
      />
      <div className="relative">
        <select
          value={value || ""}
          onChange={handleChange}
          disabled={disabled || isLoading}
          className="flex h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] disabled:opacity-50"
        >
          <option value="" disabled>اختر المحل...</option>
          {data?.data.map((store) => (
            <option key={store.public_id} value={store.public_id}>
              {store.name_ar} {store.owner ? `(${store.owner.name})` : ""}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}
