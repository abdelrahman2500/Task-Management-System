import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../shared/components/ui/Table";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";

import { can } from "../../../shared/permissions/can";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { ROLE_LABELS } from "../schemas/user.schema";
import type { User } from "../types";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const roleVariants: Record<string, "default" | "info" | "success" | "warning" | "danger" | "secondary"> = {
  OWNER: "danger",
  ADMIN: "warning",
  MEMBER: "info",
  VIEWER: "secondary",
};

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const canUpdate = can(currentUser, "update", "users", {
            ownerId: user.id,
            currentUserId: currentUser?.id,
          });
          const canDelete = can(currentUser, "delete", "users", {
            ownerId: user.id,
          });
          const canView = can(currentUser, "read", "users", {
            ownerId: user.id,
            currentUserId: currentUser?.id,
          });

          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-slate-600">{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleVariants[user.role] ?? "default"} size="sm">
                  {ROLE_LABELS[user.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.isActive ? "success" : "default"}
                  size="sm"
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="relative inline-block">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-auto h-9 px-2"
                    onClick={() =>
                      setOpenMenuId(openMenuId === user.id ? null : user.id)
                    }
                  >
                    <MoreHorizontal size={16} />
                  </Button>

                  {openMenuId === user.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        {canView && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/users/${user.id}`);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Eye size={14} />
                            View details
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onEdit(user);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onDelete(user);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Deactivate
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
