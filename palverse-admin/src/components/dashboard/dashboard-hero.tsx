"use client";

import { ReactNode } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Sparkles } from "lucide-react";

interface DashboardHeroProps {
  userName?: string;
  children?: ReactNode;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  if (hour < 17) return "مساء الخير";
  return "مساء الخير";
}

export function DashboardHero({ userName, children }: DashboardHeroProps) {
  const today = format(new Date(), "EEEE، d MMMM yyyy", { locale: ar });

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#1E7D4E]/20 bg-gradient-to-bl from-[#0F3D2E] via-[#145A40] to-[#1E7D4E] p-6 sm:p-8 text-white shadow-lg shadow-[#0F3D2E]/10">
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-[#7FA789]/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#C8DEC9] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            لوحة تحكم Palverse
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {getGreeting()}
              {userName ? `، ${userName}` : ""}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#C8DEC9] sm:text-base">
              نظرة شاملة على أداء المنصة، المحلات، الاشتراكات، والمبيعات الميدانية
            </p>
          </div>

          <p className="text-xs text-white/70 sm:text-sm">{today}</p>
        </div>

        {children && (
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
