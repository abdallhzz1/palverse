"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const LocationPickerInner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 dark:bg-[#171717] rounded-xl flex items-center justify-center border border-gray-200 dark:border-[#1F2522]">
      <div className="w-6 h-6 border-2 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

interface PublicMapProps {
  latitude: number | null;
  longitude: number | null;
  storeName: string;
}

export default function PublicMap({ latitude, longitude, storeName }: PublicMapProps) {
  if (!latitude || !longitude) {
    return (
      <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-8 text-center border border-[#EAF3EC] dark:border-[#1F2522]">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">الموقع على الخريطة غير متوفر</p>
      </div>
    );
  }

  const handleDirections = () => {
    // Generate a universal Google Maps directions link that works on web and mobile
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">موقع المحل</h2>
        <button
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
    </div>
  );
}
