import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        
        <div className="bg-white dark:bg-[#1F2522] rounded-xl border border-slate-100 dark:border-emerald-900/30 p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-[300px] w-full rounded-full mx-auto max-w-[200px]" />
        </div>
      </div>
    </div>
  );
}
