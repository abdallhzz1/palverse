"use client";

import { useEffect, useState, use } from "react";
import { Clock, Plus, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { merchantService } from "@/services/merchant.service";
import type { WorkingHours, WorkingDay, WorkingPeriod } from "@/types/merchant";

// Backend day_of_week: 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
const DAYS = [
  { id: "6", name: "السبت" },
  { id: "0", name: "الأحد" },
  { id: "1", name: "الإثنين" },
  { id: "2", name: "الثلاثاء" },
  { id: "3", name: "الأربعاء" },
  { id: "4", name: "الخميس" },
  { id: "5", name: "الجمعة" },
];

export default function StoreWorkingHoursPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [hours, setHours] = useState<WorkingHours>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    merchantService.getWorkingHours(resolvedParams.publicId)
      .then(res => {
        // Initialize if empty
        const initHours = { ...res };
        DAYS.forEach(day => {
          if (!initHours[day.id]) {
            initHours[day.id] = { is_closed: false, periods: [{ start: "09:00", end: "17:00" }] };
          }
        });
        setHours(initHours);
      })
      .catch(() => setError("فشل في تحميل ساعات العمل"))
      .finally(() => setIsLoading(false));
  }, [resolvedParams.publicId]);

  const toggleClosed = (dayId: string) => {
    setHours(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        is_closed: !prev[dayId].is_closed
      }
    }));
  };

  const updatePeriod = (dayId: string, index: number, field: 'start' | 'end', value: string) => {
    setHours(prev => {
      const day = prev[dayId];
      const newPeriods = [...day.periods];
      newPeriods[index] = { ...newPeriods[index], [field]: value };
      return { ...prev, [dayId]: { ...day, periods: newPeriods } };
    });
  };

  const addPeriod = (dayId: string) => {
    setHours(prev => {
      const day = prev[dayId];
      return {
        ...prev,
        [dayId]: { ...day, periods: [...day.periods, { start: "18:00", end: "22:00" }] }
      };
    });
  };

  const removePeriod = (dayId: string, index: number) => {
    setHours(prev => {
      const day = prev[dayId];
      const newPeriods = day.periods.filter((_, i) => i !== index);
      return { ...prev, [dayId]: { ...day, periods: newPeriods } };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await merchantService.updateWorkingHours(resolvedParams.publicId, hours);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "فشل في حفظ ساعات العمل");
    } finally {
      setIsSaving(false);
      window.scrollTo(0, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
        ساعات العمل
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#171717] rounded-2xl p-6 md:p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-bold border border-green-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            تم حفظ ساعات العمل بنجاح!
          </div>
        )}

        <div className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#0F3D2E] dark:text-[#EAF3EC] p-4 rounded-lg text-sm border border-[#1E7D4E]/20 flex items-start gap-3">
          <Clock className="w-5 h-5 mt-0.5 text-[#1E7D4E] dark:text-[#7FA789]" />
          <p>أدخل ساعات العمل بدقة لتجنب إحباط العملاء. يمكنك تحديد المحل كمغلق في أيام معينة، أو إضافة فترتي عمل في اليوم الواحد (مثلاً صباحية ومسائية).</p>
        </div>

        <div className="space-y-6">
          {DAYS.map(day => {
            const dayData = hours[day.id];
            if (!dayData) return null;

            return (
              <div key={day.id} className="flex flex-col md:flex-row md:items-start gap-4 p-4 border border-[#EAF3EC] dark:border-[#1F2522] rounded-xl">
                <div className="w-32 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!dayData.is_closed}
                    onChange={() => toggleClosed(day.id)}
                    className="w-5 h-5 text-[#1E7D4E] rounded border-gray-300 focus:ring-[#1E7D4E]"
                  />
                  <span className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{day.name}</span>
                </div>

                <div className="flex-1 space-y-3">
                  {dayData.is_closed ? (
                    <div className="py-2 text-gray-500 font-medium">مغلق</div>
                  ) : (
                    <>
                      {dayData.periods.map((period, index) => (
                        <div key={index} className="flex items-center gap-3 flex-wrap">
                          <input
                            type="time"
                            value={period.start}
                            onChange={(e) => updatePeriod(day.id, index, 'start', e.target.value)}
                            className="px-3 py-2 border rounded-lg dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]"
                            required
                          />
                          <span className="text-gray-500">إلى</span>
                          <input
                            type="time"
                            value={period.end}
                            onChange={(e) => updatePeriod(day.id, index, 'end', e.target.value)}
                            className="px-3 py-2 border rounded-lg dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]"
                            required
                          />
                          {dayData.periods.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePeriod(day.id, index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addPeriod(day.id)}
                        className="text-sm font-bold text-[#1E7D4E] flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة فترة
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-[#EAF3EC] dark:border-[#1F2522]">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "حفظ ساعات العمل"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
