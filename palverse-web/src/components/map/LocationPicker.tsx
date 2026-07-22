"use client";

import dynamic from "next/dynamic";

// Map components must be loaded dynamically on client-side to prevent SSR issues with Leaflet
const LocationPickerInner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 dark:bg-[#171717] rounded-xl flex items-center justify-center border border-gray-200 dark:border-[#1F2522]">
      <div className="w-6 h-6 border-2 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  className?: string;
  readOnly?: boolean;
}

export default function LocationPicker(props: LocationPickerProps) {
  return <LocationPickerInner {...props} />;
}
