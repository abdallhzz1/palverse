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
    <ul className="space-y-0 text-sm">
      {hours.map((h, i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-3 border-b border-[#E2EAE5] py-2.5 last:border-0"
        >
          <span className="font-semibold text-[#1A3D32]">{h.day}</span>
          <span
            className={
              h.isOpen ? "font-medium tracking-wide text-[#2F6B4F]" : "font-medium text-red-500"
            }
            dir="ltr"
          >
            {h.isOpen ? `${h.openTime} – ${h.closeTime}` : "مغلق"}
          </span>
        </li>
      ))}
    </ul>
  );
}
