import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { can } from "../../../shared/permissions/can";
import { UserTable } from "../components/UserTable";
import { UserSearch } from "../components/UserSearch";
import { UserFilters } from "../components/UserFilters";
import { UserPagination } from "../components/UserPagination";
import { CreateUserModal } from "../components/CreateUserModal";
import { EditUserModal } from "../components/EditUserModal";
import { DeleteUserDialog } from "../components/DeleteUserDialog";
import { UserSkeleton } from "../components/UserSkeleton";
import { Button } from "../../../shared/components/ui/Button";
import { ErrorState } from "../../../shared/components/ui/ErrorState";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import type { ListUsersParams, User } from "../types";

export default function UsersPage() {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = can(currentUser, "delete", "users");

  const [params, setParams] = useState<ListUsersParams>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useUsers({
    ...params,
    search: search || undefined,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setParams((p) => ({ ...p, page: 1 }));
  };

  const handleFiltersChange = (filters: ListUsersParams) => {
    setParams(filters);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage team members and their roles.
          </p>
        </div>
        {isAdmin && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsCreateOpen(true)}
          >
            <UserPlus size={17} className="mr-2" />
            New User
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <UserSearch value={search} onChange={handleSearchChange} />
        <UserFilters filters={params} onChange={handleFiltersChange} />
      </div>

      {/* Content */}
      {isLoading && <UserSkeleton />}

      {isError && (
        <ErrorState
          title="Failed to load users"
          description="There was a problem fetching users. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No users found"
          description={
            search
              ? "No users match your search. Try different keywords."
              : "No users have been created yet."
          }
          action={
            isAdmin
              ? { label: "Create User", onClick: () => setIsCreateOpen(true) }
              : undefined
          }
        />
      )}

      {!isLoading && !isError && (data?.data.length ?? 0) > 0 && (
        <>
          <UserTable
            users={data!.data as User[]}
            onEdit={setEditUser}
            onDelete={setDeleteUser}
          />
          <UserPagination
            data={data}
            onPageChange={(page) => setParams((p) => ({ ...p, page }))}
          />
        </>
      )}

      {/* Modals */}
      {isAdmin && (
        <CreateUserModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      <EditUserModal
        open={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
      />
      <DeleteUserDialog
        open={!!deleteUser}
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
      />
    </div>
  );
}
