const OrdersSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`tab-skeleton-${index}`}
            className="h-9 w-24 animate-pulse rounded-full bg-neutral-2"
          />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`order-skeleton-${idx}`}
            className="animate-pulse rounded-2xl border border-border-2 bg-background-2 p-4"
          >
            <div className="flex items-center gap-3 border-b border-border-2 pb-4">
              <div className="h-12 w-12 rounded-full bg-neutral-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-neutral-2" />
                <div className="h-3 w-24 rounded bg-neutral-1" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-neutral-2" />
                <div className="h-6 w-20 rounded-full bg-neutral-2" />
              </div>
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 2 }).map((__, productIdx) => (
                <div key={productIdx} className="flex gap-3">
                  <div className="h-16 w-16 rounded-lg bg-neutral-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-neutral-2" />
                    <div className="h-3 w-1/3 rounded bg-neutral-1" />
                  </div>
                </div>
              ))}
              <div className="h-5 w-1/2 rounded bg-neutral-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersSkeleton;


