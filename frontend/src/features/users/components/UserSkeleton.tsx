import { Skeleton } from "../../../shared/components/ui/Skeleton";

/**
 * UserSkeleton - Loading skeleton for user list
 * Shows placeholder rows while user data is loading
 */
export function UserSkeleton() {
  return (
    <div
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
      role="status"
      aria-label="Loading users"
      aria-busy="true"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
