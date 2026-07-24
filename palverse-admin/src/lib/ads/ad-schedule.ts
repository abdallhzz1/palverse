/** Format YYYY-MM-DD in local timezone. */
export function toDateInputValue(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultAdDateRange(days = 30): { start_date: string; end_date: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return {
    start_date: toDateInputValue(start),
    end_date: toDateInputValue(end),
  };
}

export type AdScheduleStatus = "live" | "scheduled" | "expired" | "paused";

export function getAdScheduleStatus(ad: {
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}): AdScheduleStatus {
  if (!ad.is_active) return "paused";

  const today = toDateInputValue();
  const start = (ad.start_date || "").slice(0, 10);
  const end = (ad.end_date || "").slice(0, 10);

  if (start && start > today) return "scheduled";
  if (end && end < today) return "expired";
  return "live";
}

export function adScheduleLabel(status: AdScheduleStatus): { label: string; className: string } {
  switch (status) {
    case "live":
      return { label: "على الرئيسية", className: "bg-emerald-100 text-emerald-700" };
    case "scheduled":
      return { label: "مجدول", className: "bg-amber-100 text-amber-700" };
    case "expired":
      return { label: "منتهي", className: "bg-red-100 text-red-700" };
    case "paused":
    default:
      return { label: "متوقف", className: "bg-slate-100 text-slate-600" };
  }
}
