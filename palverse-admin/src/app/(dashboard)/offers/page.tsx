import { OffersList } from "@/components/offers/offers-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "العروض - Palverse",
  description: "إدارة العروض في Palverse",
};

export default function OffersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">العروض</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            إدارة كافة العروض والمصادقة على ظهورها العام
          </p>
        </div>
      </div>

      <OffersList />
    </div>
  );
}
