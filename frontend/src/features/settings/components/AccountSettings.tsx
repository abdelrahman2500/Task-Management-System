import { useState } from "react";
import { UserCircle2, AlertTriangle, Calendar, Shield } from "lucide-react";
import { useAccountInfo } from "../hooks/useAccountInfo";
import { useLogout } from "../../auth/hooks/useLogout";
import { settingsService } from "../api/settings.service";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { ROLE_LABELS } from "../../users/schemas/user.schema";
import type { UserRole } from "../../auth/types";

export function AccountSettings() {
  const { data: account, isLoading } = useAccountInfo();
  const { mutate: logout } = useLogout();
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await settingsService.deactivateAccount();
      // After deactivation, log out
      logout();
    } finally {
      setIsDeactivating(false);
      setIsDeactivateOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    );
  }

  if (!account) return null;

  const roleLabel = ROLE_LABELS[account.role as UserRole] ?? account.role;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-green-50 p-2 text-green-600">
            <UserCircle2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Account Information
            </h2>
            <p className="text-sm text-slate-500">
              Overview of your account details.
            </p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account Status
            </dt>
            <dd className="mt-1">
              <Badge variant={account.isActive ? "success" : "default"}>
                {account.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Shield size={12} /> Role
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {roleLabel}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Calendar size={12} /> Member Since
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {new Date(account.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Projects Owned
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-slate-900">
              {account.ownedProjectsCount}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Danger zone */}
      <Card className="p-6 border-red-200">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Danger Zone
            </h2>
            <p className="text-sm text-slate-500">
              These actions are permanent and cannot be undone.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">Deactivate Account</p>
              <p className="text-sm text-slate-600">
                You will lose access immediately. Your data is preserved.
              </p>
            </div>
            <Button
              variant="danger"
              className="w-full sm:w-auto shrink-0"
              onClick={() => setIsDeactivateOpen(true)}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Account"
        description="Are you sure you want to deactivate your account? You will be logged out and will need an admin to reactivate you."
        confirmText="Deactivate"
        variant="danger"
        loading={isDeactivating}
      />
    </div>
  );
}
