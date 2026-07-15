"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsPeriod, AnalyticsDateRange } from "@/types/analytics";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface AnalyticsPeriodSelectorProps {
  selectedPeriod: AnalyticsPeriod;
  dateRange: AnalyticsDateRange;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onDateRangeChange: (range: AnalyticsDateRange) => void;
  disabled?: boolean;
}

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "اليوم" },
  { value: "last_7_days", label: "آخر 7 أيام" },
  { value: "last_30_days", label: "آخر 30 يومًا" },
  { value: "current_month", label: "هذا الشهر" },
  { value: "previous_month", label: "الشهر السابق" },
  { value: "current_year", label: "هذا العام" },
  { value: "custom", label: "فترة مخصصة" },
];

export function AnalyticsPeriodSelector({
  selectedPeriod,
  dateRange,
  onPeriodChange,
  onDateRangeChange,
  disabled
}: AnalyticsPeriodSelectorProps) {
  const [customFrom, setCustomFrom] = useState<string>(dateRange.from || "");
  const [customTo, setCustomTo] = useState<string>(dateRange.to || "");

  // Sync state if controlled values change externally
  useEffect(() => {
    if (selectedPeriod === "custom") {
      setCustomFrom(dateRange.from || "");
      setCustomTo(dateRange.to || "");
    }
  }, [dateRange, selectedPeriod]);

  const handlePeriodChange = (val: string) => {
    const period = val as AnalyticsPeriod;
    onPeriodChange(period);
    
    if (period !== "custom") {
      onDateRangeChange({ period });
    }
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo) {
      let fromDate = new Date(customFrom);
      let toDate = new Date(customTo);
      
      if (toDate < fromDate) {
        // Prevent reversed dates by swapping
        const temp = customFrom;
        setCustomFrom(customTo);
        setCustomTo(temp);
        
        fromDate = new Date(customTo);
        toDate = new Date(temp);
      }
      
      onDateRangeChange({
        period: "custom",
        from: format(fromDate, "yyyy-MM-dd"),
        to: format(toDate, "yyyy-MM-dd"),
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      {selectedPeriod === "custom" && (
        <div className="flex items-center gap-2 bg-white dark:bg-[#1F2522] border border-slate-200 dark:border-slate-700 rounded-md p-1 px-2 h-9">
          <span className="text-xs text-slate-500">من</span>
          <input 
            type="date" 
            className="text-sm bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            onBlur={handleApplyCustom}
            disabled={disabled}
            max={customTo || undefined}
          />
          <span className="text-xs text-slate-500">إلى</span>
          <input 
            type="date" 
            className="text-sm bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            onBlur={handleApplyCustom}
            disabled={disabled}
            min={customFrom || undefined}
          />
        </div>
      )}

      <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={disabled}>
        <SelectTrigger className="w-[160px] h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2522]">
          <SelectValue placeholder="اختر الفترة" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
