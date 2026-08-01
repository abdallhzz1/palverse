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
    <ul className="space-y-0 text-[15px]">
      {hours.map((h, i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-3 border-b border-[#E4E6EB] py-2 last:border-0"
        >
          <span className="font-medium text-[#050505]">{h.day}</span>
          <span
            className={h.isOpen ? "font-medium text-[#050505]" : "font-medium text-[#F02849]"}
            dir="ltr"
          >
            {h.isOpen ? `${h.openTime} – ${h.closeTime}` : "مغلق"}
          </span>
        </li>
      ))}
    </ul>
  );
}
