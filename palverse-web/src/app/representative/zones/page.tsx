"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { RepresentativeService } from "@/services/representative.service";
import type { RepresentativeZone } from "@/types/representative";

export default function RepresentativeZonesPage() {
  const [zones, setZones] = useState<RepresentativeZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await RepresentativeService.getZones();
        setZones(res.data);
      } catch (error) {
        console.error("Failed to load zones:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchZones();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">مناطقي المخصصة</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          هذه هي المناطق الجغرافية المخصصة لك للعمل بها وتسجيل المتاجر.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((item) => (
          <div key={item.public_id} className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden transition-all hover:shadow-md">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#EAF3EC] dark:bg-[#252525] rounded-xl text-[#1E7D4E]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0F3D2E] dark:text-[#EAF3EC]">{item.zone.name_ar}</h3>
                    <p className="text-sm text-gray-500">{item.zone.city.name_ar}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#EAF3EC] dark:border-[#1F2522]">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">تاريخ التخصيص:</span>
                  <span className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC]">
                    {item.assigned_at ? new Date(item.assigned_at).toLocaleDateString('ar-SA') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {zones.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522]">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">لا يوجد مناطق مخصصة</h3>
            <p className="text-gray-500">لم يتم تخصيص أي مناطق جغرافية لك بعد.</p>
          </div>
        )}
      </div>
    </div>
  );
}
