import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, UserX } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { can } from "../../../shared/permissions/can";
import { UserCard } from "../components/UserCard";
import { EditUserModal } from "../components/EditUserModal";
import { DeleteUserDialog } from "../components/DeleteUserDialog";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { Card } from "../../../shared/components/ui/Card";
import { ErrorState } from "../../../shared/components/ui/ErrorState";

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const {
    data: user,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useUser(userId ? Number(userId) : null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const canEdit = can(currentUser, "update", "users", {
    ownerId: user?.id,
    currentUserId: currentUser?.id,
  });
  const canDelete = can(currentUser, "delete", "users", { ownerId: user?.id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Skeleton variant="circular" width="64px" height="64px" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <ErrorState
        title="User not found"
        description="This user doesn't exist or you don't have permission to view them."
        onRetry={isError ? () => void refetch() : undefined}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="w-auto"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-slate-900">{user.name}</h1>
      </div>

      <UserCard user={user} />

      {(canEdit || canDelete) && (
        <div className="flex gap-3">
          {canEdit && (
            <Button
              variant="outline"
              className="w-auto"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil size={16} className="mr-2" />
              Edit User
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              className="w-auto"
              onClick={() => setIsDeleteOpen(true)}
            >
              <UserX size={16} className="mr-2" />
              Deactivate
            </Button>
          )}
        </div>
      )}

      <EditUserModal
        open={isEditOpen}
        user={user}
        onClose={() => setIsEditOpen(false)}
      />
      <DeleteUserDialog
        open={isDeleteOpen}
        user={user}
        onClose={() => {
          setIsDeleteOpen(false);
          navigate("/users");
        }}
      />
    </div>
  );
}
