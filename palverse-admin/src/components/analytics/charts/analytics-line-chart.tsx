"use client";

import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

interface AnalyticsLineChartProps {
  data: any[];
  xDataKey?: string;
  yDataKey?: string;
  color?: string;
  metricLabel?: string;
  formatXAxis?: (val: string) => string;
}

export function AnalyticsLineChart({
  data,
  xDataKey = "period",
  yDataKey = "count",
  color = "#1E7D4E",
  metricLabel = "العدد",
  formatXAxis,
}: AnalyticsLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const defaultFormatXAxis = (val: string) => {
    try {
      // Basic detection of date-like string (YYYY-MM-DD or YYYY-MM)
      if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return format(parseISO(val), "dd MMM", { locale: ar });
      } else if (val.match(/^\d{4}-\d{2}$/)) {
        return format(parseISO(val + "-01"), "MMMM yyyy", { locale: ar });
      }
      return val;
    } catch {
      return val;
    }
  };

  const xFormatter = formatXAxis || defaultFormatXAxis;

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        لا توجد بيانات متاحة لهذه الفترة
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDark ? "#2A3430" : "#F1F5F9"}
          />
          <XAxis
            dataKey={xDataKey}
            tickFormatter={xFormatter}
            tick={{ fill: isDark ? "#94A3B8" : "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dy={10}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: isDark ? "#94A3B8" : "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dx={-10}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1F2522" : "#FFFFFF",
              borderColor: isDark ? "#2A3430" : "#E2E8F0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              direction: "rtl",
            }}
            itemStyle={{ color: isDark ? "#FFFFFF" : "#0F3D2E", fontWeight: 500 }}
            labelStyle={{ color: isDark ? "#94A3B8" : "#64748B", marginBottom: "4px" }}
            labelFormatter={(label) => xFormatter(label as string)}
            formatter={(value: any) => [
              Number(value).toLocaleString("ar-EG"),
              metricLabel,
            ]}
          />
          <Line
            type="monotone"
            dataKey={yDataKey}
            stroke={color}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: color }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
