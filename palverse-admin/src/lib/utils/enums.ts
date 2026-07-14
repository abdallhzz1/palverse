export const getStoreStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "معتمد",
    rejected: "مرفوض",
    active: "نشط",
    inactive: "غير نشط",
  };
  return map[status] || status;
};

export const getStoreStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: "var(--color-amber-500)", // Using tailwind vars or direct colors
    approved: "var(--color-emerald-600)",
    rejected: "var(--color-red-600)",
    active: "var(--color-emerald-600)",
    inactive: "var(--color-slate-400)",
  };
  return map[status] || "var(--color-slate-400)";
};

export const getSubscriptionStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    active: "نشط",
    expired: "منتهي",
    cancelled: "ملغي",
    future: "قادم",
  };
  return map[status] || status;
};

export const getSubscriptionStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    active: "var(--color-emerald-600)",
    expired: "var(--color-red-500)",
    cancelled: "var(--color-slate-400)",
    future: "var(--color-amber-500)",
  };
  return map[status] || "var(--color-slate-400)";
};

export const getUserStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    active: "نشط",
    inactive: "غير نشط",
    suspended: "موقوف",
  };
  return map[status] || status;
};
