"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardBreakdownItem } from "@/types/analytics";
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
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground">
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

  if (!mounted) return <div className="h-[280px]" />;

  return (
    <div className="space-y-5">
      <div className="relative h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [formatNumber(Number(value) || 0), "العدد"]}
              contentStyle={{
                backgroundColor: resolvedTheme === "dark" ? "#1F2522" : "#FFFFFF",
                borderColor: resolvedTheme === "dark" ? "rgba(16, 185, 129, 0.2)" : "#e2e8f0",
                borderRadius: "10px",
                color: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a",
              }}
              itemStyle={{ color: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a" }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{formatNumber(total)}</span>
          <span className="text-sm text-muted-foreground">إجمالي المحلات</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-xs text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
