"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Search, ChevronRight, ChevronLeft, MapPin, ExternalLink } from "lucide-react";
import { followUpStoresService } from "@/services/followUpStores.service";
import type { FollowUpStore } from "@/types/followUpStore";

const TABS = [
  { id: "all", label: "الجميع" },
  { id: "pending", label: "قيد المراجعة" },
  { id: "approved", label: "معتمدة" },
  { id: "rejected", label: "مرفوضة" },
];

export default function FollowUpStoresListPage() {
  const [stores, setStores] = useState<FollowUpStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setQuery(searchInput.trim()), 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query]);

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      try {
        const res = await followUpStoresService.getStores(page, {
          status: statusFilter === "all" ? undefined : statusFilter,
          query: query || undefined,
        });
        setStores(res.data);
        setMeta(res.meta);
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStores();
  }, [statusFilter, query, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "قيد المراجعة";
      case "approved": return "معتمد";
      case "rejected": return "مرفوض";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">المحلات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة كاملة لمحلات المنصة: البيانات، الوسائط، ساعات العمل، روابط التواصل والعروض.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        <div className="p-4 border-b border-[#EAF3EC] dark:border-[#1F2522] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  statusFilter === tab.id
                    ? "bg-[#1E7D4E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#252525] dark:text-gray-400 dark:hover:bg-[#333]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث باسم المحل..."
              className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : stores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252525] border-b border-[#EAF3EC] dark:border-[#1F2522]">
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">المحل</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">التصنيف</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">المدينة / المنطقة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">رقم الهاتف</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">النشاط</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.public_id} className="border-b border-gray-100 dark:border-[#1F2522] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] overflow-hidden shrink-0 flex items-center justify-center">
                          {store.logo?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={store.logo.url} alt={store.name_ar} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] truncate">{store.name_ar}</p>
                          {store.web_url && store.is_publicly_visible && (
                            <a href={store.web_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1E7D4E] hover:underline flex items-center gap-1">
                              عرض للعامة <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{store.category?.name_ar || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {store.city?.name_ar || "—"} {store.zone?.name_ar ? `/ ${store.zone.name_ar}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400" dir="ltr">{store.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                        {getStatusLabel(store.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        store.is_active ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {store.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/follow-up/stores/${store.public_id}`}
                        className="text-[#1E7D4E] hover:underline font-medium text-sm"
                      >
                        إدارة المحل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">لا توجد محلات</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              لم يتم العثور على محلات مطابقة لمعايير البحث الحالية.
            </p>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-[#EAF3EC] dark:border-[#1F2522] flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page <= 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 text-[#1E7D4E] rounded-lg font-bold text-sm">
              {meta.current_page} من {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page >= meta.last_page}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
