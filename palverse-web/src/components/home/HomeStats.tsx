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
    <section className="border-t border-[#E2EAE5] bg-white py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex min-w-[120px] flex-1 flex-col items-center justify-center">
              <stat.icon className="mb-4 h-8 w-8 text-[#6B8578]" />
              <span className="mb-1 font-heading text-3xl font-bold text-[#1A3D32]" dir="ltr">{stat.value}</span>
              <span className="text-sm font-medium text-[#6B8578]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
