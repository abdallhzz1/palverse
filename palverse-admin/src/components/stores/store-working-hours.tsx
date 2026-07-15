import { StoreWorkingHour } from "@/types/store-details";
import { Clock } from "lucide-react";

interface StoreWorkingHoursProps {
  workingHours?: StoreWorkingHour[];
}

const dayMapping: Record<string, string> = {
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
};

const dayOrder = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

export function StoreWorkingHours({ workingHours }: StoreWorkingHoursProps) {
  if (!workingHours || workingHours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground bg-muted dark:bg-slate-800/50 rounded-lg border border-border dark:border-slate-700">
        <Clock className="w-6 h-6 mb-2 opacity-50" />
        <p className="text-sm">ساعات العمل غير متوفرة</p>
      </div>
    );
  }

  // Group by day to handle multiple periods
  const grouped = workingHours.reduce((acc, curr) => {
    if (!acc[curr.day]) {
      acc[curr.day] = [];
    }
    acc[curr.day].push(curr);
    return acc;
  }, {} as Record<string, StoreWorkingHour[]>);

  // Sort by defined order
  const sortedDays = Object.keys(grouped).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  return (
    <div className="space-y-3">
      {sortedDays.map((day) => {
        const periods = grouped[day];
        // If there's any record that says is_closed = true, we treat the day as closed
        const isClosed = periods.some(p => p.is_closed);

        return (
          <div key={day} className="flex justify-between items-center py-2 border-b border-border dark:border-slate-800 last:border-0 last:pb-0">
            <span className="font-medium text-sm">{dayMapping[day] || day}</span>
            <div className="text-sm text-muted-foreground dark:text-slate-300 text-left" dir="ltr">
              {isClosed ? (
                <span className="text-red-500 dark:text-red-400 font-medium">مغلق</span>
              ) : (
                <div className="space-y-1">
                  {periods.map((p, idx) => (
                    <div key={idx}>
                      {p.open_time && p.close_time ? `${p.open_time} - ${p.close_time}` : "مفتوح"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
