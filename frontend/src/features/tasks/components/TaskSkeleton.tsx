function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-slate-200 ${className}`} />;
}

function SkeletonCard() {
  return <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><SkeletonLine className="h-5 w-20" /><SkeletonLine className="h-5 w-16" /></div><SkeletonLine className="h-5 w-3/4" /><SkeletonLine className="h-3 w-full" /><SkeletonLine className="h-3 w-2/3" /><div className="flex justify-between"><SkeletonLine className="h-4 w-28" /><SkeletonLine className="h-8 w-20" /></div></div>;
}

function SkeletonRow() {
  return <tr className="border-b border-slate-100"><td className="px-5 py-4"><SkeletonLine className="h-4 w-48" /><SkeletonLine className="mt-2 h-3 w-32" /></td><td className="px-4 py-4"><SkeletonLine className="h-6 w-20" /></td><td className="px-4 py-4"><SkeletonLine className="h-4 w-16" /></td><td className="px-4 py-4"><SkeletonLine className="h-4 w-20" /></td><td className="px-4 py-4"><SkeletonLine className="h-4 w-24" /></td><td className="px-5 py-4"><SkeletonLine className="ml-auto h-8 w-20" /></td></tr>;
}

export function TaskSkeleton() {
  return <section aria-label="Loading tasks" aria-busy="true" className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="hidden min-h-120 overflow-x-auto xl:block"><table className="w-full min-w-[720px]"><thead className="bg-slate-50"><tr>{Array.from({ length: 6 }).map((_, index) => <th key={index} className="px-5 py-3"><SkeletonLine className="h-3 w-16" /></th>)}</tr></thead><tbody>{Array.from({ length: 7 }).map((_, index) => <SkeletonRow key={index} />)}</tbody></table></div><div className="grid min-h-120 gap-3 p-3 xl:hidden">{Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}</div></section>;
}
