function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex justify-between">
        <div className="h-5 w-20 rounded-full bg-slate-200" />
        <div className="h-5 w-14 rounded bg-slate-200" />
      </div>
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mb-1 h-3 rounded bg-slate-200" />
      <div className="mb-4 h-3 w-5/6 rounded bg-slate-200" />
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-4 flex gap-3">
        <div className="h-9 flex-1 rounded-lg bg-slate-200" />
        <div className="h-9 flex-1 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
