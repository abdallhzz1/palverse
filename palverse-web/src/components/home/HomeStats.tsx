import { FileText, UserPlus, Building, Search, Globe } from "lucide-react";
import { serverFetch } from "@/lib/api/server";

function formatStat(num: number) {
  if (!num || num === 0) return "0";
  if (num >= 1000000) return `+${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  if (num >= 1000) return `+${(num / 1000).toFixed(1).replace('.0', '')}K`;
  return `+${num}`;
}

export async function HomeStats() {
  let statsData = {
    stores_count: 0,
    clients_count: 0,
    cities_count: 0,
    searches_count: 0,
    visits_count: 0
  };

  try {
    const res = await serverFetch<{ data: any }>('/stats');
    if (res?.data) {
      statsData = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch home stats", error);
  }

  const stats = [
    { value: formatStat(statsData.stores_count), label: "نشاط مسجل", icon: FileText },
    { value: formatStat(statsData.clients_count), label: "عميل سعيد", icon: UserPlus },
    { value: formatStat(statsData.cities_count), label: "مدينة وبلدة", icon: Building },
    { value: formatStat(statsData.searches_count), label: "عملية بحث", icon: Search },
    { value: formatStat(statsData.visits_count), label: "زيارات الموقع", icon: Globe },
  ];

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-wrap justify-between items-center gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center flex-1 min-w-[120px]">
              <stat.icon className="w-8 h-8 text-[#7FA789] mb-4" />
              <span className="text-3xl font-bold text-[#0F3D2E] font-heading mb-1" dir="ltr">{stat.value}</span>
              <span className="text-sm font-medium text-[#7FA789]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
