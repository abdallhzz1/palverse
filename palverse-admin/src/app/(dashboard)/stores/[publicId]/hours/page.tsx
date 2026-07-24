"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Plus, Trash2, Save } from "lucide-react";
import { StoreDetailNav } from "@/components/stores/store-detail-nav";
import { Button } from "@/components/ui/button";
import { useStoreWorkingHours } from "@/hooks/use-store-working-hours";
import type { WorkingHours } from "@/types/store";

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
  const { publicId } = use(params);
  const { hours, isLoading, isSaving, save } = useStoreWorkingHours(publicId);
  const [form, setForm] = useState<WorkingHours>({});

  useEffect(() => {
    if (!isLoading) {
      const initHours: WorkingHours = { ...hours };
      DAYS.forEach((day) => {
        if (!initHours[day.id]) {
          initHours[day.id] = { is_closed: false, periods: [{ start: "09:00", end: "17:00" }] };
        }
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initHours);
    }
  }, [isLoading, hours]);

  const toggleClosed = (dayId: string) => {
    setForm((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], is_closed: !prev[dayId].is_closed },
    }));
  };

  const updatePeriod = (dayId: string, index: number, field: "start" | "end", value: string) => {
    setForm((prev) => {
      const day = prev[dayId];
      const newPeriods = [...day.periods];
      newPeriods[index] = { ...newPeriods[index], [field]: value };
      return { ...prev, [dayId]: { ...day, periods: newPeriods } };
    });
  };

  const addPeriod = (dayId: string) => {
    setForm((prev) => {
      const day = prev[dayId];
      return { ...prev, [dayId]: { ...day, periods: [...day.periods, { start: "18:00", end: "22:00" }] } };
    });
  };

  const removePeriod = (dayId: string, index: number) => {
    setForm((prev) => {
      const day = prev[dayId];
      return { ...prev, [dayId]: { ...day, periods: day.periods.filter((_, i) => i !== index) } };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save(form);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${publicId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">ساعات العمل</h2>
        </div>
      </div>

      <StoreDetailNav publicId={publicId} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8"
        >
          <div className="bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#0F3D2E] dark:text-[#EAF3EC] p-4 rounded-lg text-sm border border-[#1E7D4E]/20 flex items-start gap-3">
            <Clock className="w-5 h-5 mt-0.5 text-[#1E7D4E] dark:text-[#7FA789] shrink-0" />
            <p>
              أدخل ساعات العمل بدقة لتجنب إحباط العملاء. يمكنك تحديد المحل كمغلق في أيام معينة، أو إضافة فترتي عمل في
              اليوم الواحد (مثلاً صباحية ومسائية).
            </p>
          </div>

          <div className="space-y-6">
            {DAYS.map((day) => {
              const dayData = form[day.id];
              if (!dayData) return null;

              return (
                <div
                  key={day.id}
                  className="flex flex-col md:flex-row md:items-start gap-4 p-4 border border-border dark:border-slate-800 rounded-xl"
                >
                  <div className="w-32 flex items-center gap-3 shrink-0">
                    <input
                      type="checkbox"
                      checked={!dayData.is_closed}
                      onChange={() => toggleClosed(day.id)}
                      className="w-5 h-5 accent-[#1E7D4E] rounded border-gray-300 focus:ring-[#1E7D4E]"
                    />
                    <span className="font-bold text-foreground dark:text-white">{day.name}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {dayData.is_closed ? (
                      <div className="py-2 text-muted-foreground font-medium">مغلق</div>
                    ) : (
                      <>
                        {dayData.periods.map((period, index) => (
                          <div key={index} className="flex items-center gap-3 flex-wrap">
                            <input
                              type="time"
                              value={period.start}
                              onChange={(e) => updatePeriod(day.id, index, "start", e.target.value)}
                              className="px-3 py-2 border border-border rounded-lg bg-background dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                              required
                            />
                            <span className="text-muted-foreground">إلى</span>
                            <input
                              type="time"
                              value={period.end}
                              onChange={(e) => updatePeriod(day.id, index, "end", e.target.value)}
                              className="px-3 py-2 border border-border rounded-lg bg-background dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                              required
                            />
                            {dayData.periods.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePeriod(day.id, index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addPeriod(day.id)}
                          className="text-sm font-bold text-[#1E7D4E] dark:text-emerald-400 flex items-center gap-1 hover:underline"
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

          <div className="flex justify-end pt-4 border-t border-border dark:border-slate-800">
            <Button type="submit" disabled={isSaving} className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "جاري الحفظ..." : "حفظ ساعات العمل"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
