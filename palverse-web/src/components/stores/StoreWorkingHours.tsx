import { Clock } from "lucide-react";

interface WorkingHour {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface StoreWorkingHoursProps {
  hours: WorkingHour[];
}

export function StoreWorkingHours({ hours }: StoreWorkingHoursProps) {
  if (!hours || hours.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 flex items-center justify-center text-[#1E7D4E]">
          <Clock className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">أوقات العمل</h3>
      </div>
      
      <ul className="space-y-0 text-sm">
        {hours.map((h, i) => (
          <li key={i} className="flex justify-between items-center py-2.5 border-b border-[#EAF3EC] dark:border-[#0F3D2E] last:border-0">
            <span className="font-semibold text-[#0F3D2E] dark:text-[#EAF3EC]">{h.day}</span>
            <span className={h.isOpen ? "text-[#1E7D4E] font-medium tracking-wide" : "text-red-500 font-medium"}>
              {h.isOpen ? `${h.openTime} - ${h.closeTime}` : "مغلق"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
