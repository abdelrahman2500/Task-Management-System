import { Card } from "../../../shared/components/ui/Card";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { UserCard } from "./UserCard";
import type { User } from "../types";

interface UserDetailsProps {
  user: User | undefined;
  isLoading: boolean;
}

export function UserDetails({ user, isLoading }: UserDetailsProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Skeleton variant="circular" width="64px" height="64px" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  if (!user) return null;

  return <UserCard user={user} />;
}
