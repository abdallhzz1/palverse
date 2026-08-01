"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const LocationPickerInner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] bg-gray-100 dark:bg-[#171717] rounded-xl flex items-center justify-center border border-gray-200 dark:border-[#1F2522]">
      <div className="w-6 h-6 border-2 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

interface PublicMapProps {
  latitude: number | null;
  longitude: number | null;
  storeName: string;
  /** Compact sidebar embedding without page-level heading chrome. */
  compact?: boolean;
}

export default function PublicMap({ latitude, longitude, storeName, compact = false }: PublicMapProps) {
  if (!latitude || !longitude) {
    return (
      <div className="bg-gray-50 dark:bg-[#1A1A1A] p-8 text-center">
        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium text-sm">الموقع على الخريطة غير متوفر</p>
      </div>
    );
  }

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  if (compact) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-[#E2EAE5] px-4 py-3">
          <h3 className="text-sm font-bold text-[#1A3D32]">موقع المحل</h3>
          <button
            type="button"
            onClick={handleDirections}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6B4F] hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            الاتجاهات
          </button>
        </div>
        <div className="h-[200px] w-full overflow-hidden">          <LocationPickerInner
            latitude={latitude}
            longitude={longitude}
            onChange={() => {}}
            readOnly={true}
            className="h-full gap-0"
            mapClassName="!h-full !min-h-0 !rounded-none !border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">موقع المحل</h2>
        <button
          type="button"
          onClick={handleDirections}
          className="flex items-center gap-2 px-4 py-2 bg-[#EAF3EC] dark:bg-[#1F2522] text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg hover:bg-[#D5E8DC] transition-colors text-sm font-bold"
        >
          <MapPin className="w-4 h-4" />
          الحصول على الاتجاهات
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm">
        <LocationPickerInner
          latitude={latitude}
          longitude={longitude}
          onChange={() => {}}
          readOnly={true}
        />
      </div>
      <p className="sr-only">{storeName}</p>
    </div>
  );
}
