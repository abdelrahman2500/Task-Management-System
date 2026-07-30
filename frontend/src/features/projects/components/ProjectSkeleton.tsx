function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 h-10 w-10 rounded-lg bg-slate-200" />

      <div className="mb-3 h-5 w-2/3 rounded bg-slate-200" />

      <div className="mb-2 h-4 rounded bg-slate-200" />

      <div className="mb-6 h-4 w-4/5 rounded bg-slate-200" />

      <div className="h-3 w-24 rounded bg-slate-200" />
    </div>
  );
}

export function ProjectSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
