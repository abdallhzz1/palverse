"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CitiesList } from "@/components/taxonomy/cities-list";
import { ZonesList } from "@/components/taxonomy/zones-list";
import { useEffect, useState } from "react";

export default function LocationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<string>("cities");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "cities" || tab === "zones") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", value);
    // When switching tabs, it's a good UX to clear pagination or other specific filters 
    // to avoid carrying over `page=2` to a different list.
    newParams.delete("page");
    if (value === "cities") {
      newParams.delete("city"); // clear zone specific filters
    }
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">المدن والمناطق</h2>
        <p className="text-slate-500">إدارة المواقع الجغرافية للمحلات</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="cities">المدن</TabsTrigger>
          <TabsTrigger value="zones">المناطق</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="cities" className="m-0 focus-visible:outline-none">
            <CitiesList />
          </TabsContent>
          <TabsContent value="zones" className="m-0 focus-visible:outline-none">
            <ZonesList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
