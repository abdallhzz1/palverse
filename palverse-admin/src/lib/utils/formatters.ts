export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("ar-PS").format(value);
};

export const formatCompactNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("ar-PS", { notation: "compact" }).format(value);
};

export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0%";
  return new Intl.NumberFormat("ar-PS", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(value / 100);
};

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "";
  try {
    return new Intl.DateTimeFormat("ar-PS", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return "";
  try {
    return new Intl.DateTimeFormat("ar-PS", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch (_e) {
    return dateString;
  }
};
