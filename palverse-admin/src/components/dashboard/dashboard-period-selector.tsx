import { DashboardPeriod } from "@/types/dashboard";

interface DashboardPeriodSelectorProps {
  selected: DashboardPeriod | "custom";
  onChange: (period: DashboardPeriod | "custom") => void;
  disabled?: boolean;
}

export function DashboardPeriodSelector({ selected, onChange, disabled }: DashboardPeriodSelectorProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value as DashboardPeriod | "custom")}
      disabled={disabled}
      className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2522] px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="تحديد فترة لوحة التحكم"
    >
      <option value="today">اليوم</option>
      <option value="last_7_days">آخر 7 أيام</option>
      <option value="last_30_days">آخر 30 يوم</option>
      <option value="current_month">الشهر الحالي</option>
      <option value="current_year">هذا العام</option>
    </select>
  );
}
