"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerInnerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  className?: string;
  readOnly?: boolean;
}

function LocationMarker({ position, setPosition, readOnly }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, readOnly?: boolean }) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        setPosition(e.latlng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function LocationPickerInner({
  latitude,
  longitude,
  onChange,
  className = "",
  readOnly = false,
}: LocationPickerInnerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    latitude && longitude ? new L.LatLng(latitude, longitude) : null
  );

  const defaultCenter: L.LatLngExpression = [31.5326, 35.0998]; // Default to Hebron

  useEffect(() => {
    if (position) {
      onChange(Number(position.lat.toFixed(7)), Number(position.lng.toFixed(7)));
    } else {
      onChange(null, null);
    }
  }, [position]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("تعذر الحصول على موقعك. يرجى التأكد من منح الصلاحية.");
        }
      );
    } else {
      alert("متصفحك لا يدعم تحديد الموقع.");
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden border border-gray-200 dark:border-[#1F2522]">
        <MapContainer
          center={position || defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} readOnly={readOnly} />
        </MapContainer>
      </div>

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="flex items-center gap-2 px-4 py-2 bg-[#EAF3EC] dark:bg-[#1F2522] text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg hover:bg-[#D5E8DC] transition-colors text-sm font-semibold"
          >
            <MapPin className="w-4 h-4" />
            استخدام موقعي الحالي
          </button>

          {position && (
            <button
              type="button"
              onClick={() => setPosition(null)}
              className="text-red-500 hover:text-red-600 text-sm font-semibold"
            >
              مسح الموقع
            </button>
          )}
        </div>
      )}

      {position && (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
          {position.lat.toFixed(7)}, {position.lng.toFixed(7)}
        </div>
      )}
    </div>
  );
}
