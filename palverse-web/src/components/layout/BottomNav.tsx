"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, LayoutGrid, Headset } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "المناطق", href: "/stores", icon: Compass },
    { isAction: true, href: "/join-us", icon: Plus, name: "أضف نشاطك" },
    { name: "الفئات", href: "/categories", icon: LayoutGrid },
    { name: "تواصل", href: "/contact", icon: Headset },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#111714]/95 backdrop-blur-xl border-t border-[#EAF3EC] dark:border-[#0F3D2E]/40 pb-safe shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)] rounded-t-[2.5rem] pt-1">
      <div className="flex justify-between items-end h-20 px-2 sm:px-4 relative">
        {navItems.map((item, index) => {
          // Check if active (handle exact match for home, and prefix match for others)
          const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <div key="action-btn" className="relative -top-8 flex flex-col items-center shrink-0 mx-1">
                <Link
                  href={item.href}
                  className="flex items-center justify-center w-[3.5rem] h-[3.5rem] bg-gradient-to-tr from-[#1E7D4E] to-[#2ebf76] text-white rounded-[1.25rem] shadow-[0_8px_20px_rgba(30,125,78,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(30,125,78,0.5)] transition-all duration-300 border-[4px] border-white dark:border-[#111714] rotate-45 group"
                >
                  <Icon 
                    className="w-7 h-7 -rotate-45 group-hover:scale-110 transition-transform duration-300" 
                    strokeWidth={2.5} 
                  />
                </Link>
                {/* Optional floating label below the action button */}
                <span className="absolute -bottom-5 text-[10px] font-black text-[#1E7D4E] dark:text-[#4ade80] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.name}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-[4.5rem] h-full pb-3 pt-2 relative group"
            >
              {/* Active Indicator Top Line */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1E7D4E] dark:bg-[#4ade80] rounded-b-full shadow-[0_2px_8px_rgba(30,125,78,0.6)]" />
              )}
              
              <div className={cn(
                "relative p-2.5 rounded-2xl transition-all duration-300 mb-1 flex items-center justify-center",
                isActive 
                  ? "bg-[#EAF3EC] dark:bg-[#1E7D4E]/20 text-[#1E7D4E] dark:text-[#4ade80] -translate-y-1" 
                  : "text-[#7FA789] dark:text-gray-400 group-hover:bg-gray-50 dark:group-hover:bg-[#1f2c26] group-hover:text-[#0F3D2E] dark:group-hover:text-[#EAF3EC]"
              )}>
                <Icon 
                  className={cn("w-[1.35rem] h-[1.35rem] transition-transform duration-300", isActive && "scale-110")} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-[10px] transition-all duration-300 text-center w-full",
                isActive ? "font-extrabold text-[#1E7D4E] dark:text-[#4ade80]" : "font-semibold text-[#7FA789] dark:text-gray-400"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
