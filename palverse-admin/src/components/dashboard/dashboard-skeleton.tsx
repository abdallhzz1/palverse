import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      <Skeleton className="h-40 w-full rounded-2xl" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
            <Skeleton className="mt-4 h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <Skeleton className="mb-6 h-6 w-32" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="mb-6 h-6 w-32" />
          <Skeleton className="mx-auto h-[240px] w-[240px] rounded-full" />
        </div>
      </div>
    </div>
  );
}
