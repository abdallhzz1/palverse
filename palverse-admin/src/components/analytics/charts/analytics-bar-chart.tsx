"use client";

import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AnalyticsBarChartProps {
  data: any[];
  xDataKey?: string;
  yDataKey?: string;
  color?: string;
  metricLabel?: string;
  formatXAxis?: (val: string) => string;
}

export function AnalyticsBarChart({
  data,
  xDataKey = "label_ar",
  yDataKey = "count",
  color = "#1E7D4E",
  metricLabel = "العدد",
  formatXAxis,
}: AnalyticsBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        لا توجد بيانات متاحة
      </div>
    );
  }

  const xFormatter = formatXAxis || ((val: string) => val);

  return (
    <div className="h-[300px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
            angle={-45}
            textAnchor="end"
            height={60}
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
            formatter={(value: any) => [
              Number(value).toLocaleString("ar-EG"),
              metricLabel,
            ]}
          />
          <Bar
            dataKey={yDataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
            animationDuration={500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
