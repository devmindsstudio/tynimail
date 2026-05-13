export const AnalyticsSkeletonPage = () => {
  return (
    <div className="animate-pulse">
      {/* Top Section */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>

        {/* Select Skeleton */}
        <div className="w-[180px] h-9 bg-muted rounded-md" />
      </div>

      {/* Cards Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-muted">
            <div className="flex items-center gap-6.25">
              <div className="w-12 h-12 rounded-full bg-background/40" />
              <div className="flex flex-col gap-1">
                <div className="h-6 w-20 bg-background/40 rounded" />
                <div className="h-4 w-28 bg-background/40 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        {/* Chart 1 */}
        <div className="p-5 bg-muted border border-input rounded-[14px]">
          <div className="h-6 w-52 bg-background/40 rounded mb-6" />
          <div className="h-[220px] w-full bg-background/40 rounded-lg" />
        </div>

        {/* Chart 2 */}
        <div className="p-5 bg-muted border border-input rounded-[14px]">
          <div className="h-6 w-40 bg-background/40 rounded mb-6" />
          <div className="h-[220px] w-full bg-background/40 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
