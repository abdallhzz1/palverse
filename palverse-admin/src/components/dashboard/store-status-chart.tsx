"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardBreakdownItem } from "@/types/dashboard";
import { getStoreStatusLabel, getStoreStatusColor } from "@/lib/utils/enums";
import { formatNumber } from "@/lib/utils/formatters";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface StoreStatusChartProps {
  data: DashboardBreakdownItem[];
}

export function StoreStatusChart({ data }: StoreStatusChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        لا توجد بيانات لعرضها
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: getStoreStatusLabel(item.key),
    value: item.count,
    color: getStoreStatusColor(item.key),
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (!mounted) return <div className="h-[300px]" />; // Prevent hydration mismatch

  return (
    <div className="h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [formatNumber(Number(value) || 0), "العدد"]}
            contentStyle={{ 
              backgroundColor: resolvedTheme === "dark" ? "#1F2522" : "#FFFFFF",
              borderColor: resolvedTheme === "dark" ? "rgba(16, 185, 129, 0.2)" : "#e2e8f0",
              borderRadius: "8px",
              color: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a",
            }}
            itemStyle={{ color: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a" }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-foreground dark:text-white">
          {formatNumber(total)}
        </span>
        <span className="text-sm text-muted-foreground dark:text-muted-foreground">الإجمالي</span>
      </div>
    </div>
  );
}
