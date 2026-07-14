"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardTrendItem } from "@/types/dashboard";
import { formatNumber } from "@/lib/utils/formatters";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface DashboardTrendChartProps {
  data: DashboardTrendItem[];
  metricLabel: string;
}

export function DashboardTrendChart({ data, metricLabel }: DashboardTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-slate-400">
        لا توجد بيانات للتوجه خلال هذه الفترة
      </div>
    );
  }

  if (!mounted) return <div className="h-[350px]" />;

  const isDark = resolvedTheme === "dark";
  const primaryColor = isDark ? "#34d399" : "#1E7D4E"; // Palverse primary green
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="h-[350px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            dy={10}
            // Simple date formatting for X axis (assuming YYYY-MM-DD from backend)
            tickFormatter={(val) => {
              try {
                const parts = val.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
                return val;
              } catch {
                return val;
              }
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            tickFormatter={(val) => formatNumber(val)}
          />
          <Tooltip 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [formatNumber(Number(value) || 0), metricLabel]}
            labelFormatter={(label) => `التاريخ: ${label}`}
            contentStyle={{ 
              backgroundColor: isDark ? "#1F2522" : "#FFFFFF",
              borderColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#e2e8f0",
              borderRadius: "8px",
              color: isDark ? "#f8fafc" : "#0f172a",
              direction: "rtl"
            }}
            itemStyle={{ color: primaryColor }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke={primaryColor} 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: primaryColor, stroke: isDark ? "#1F2522" : "#fff", strokeWidth: 2 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
