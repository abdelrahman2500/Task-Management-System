import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useDeleteUser } from "../hooks/useDeleteUser";
import { useState } from "react";

interface DeleteUserDialogProps {
  open: boolean;
  user: { id: number; name: string } | null;
  onClose: () => void;
}

export function DeleteUserDialog({
  open,
  user,
  onClose,
}: DeleteUserDialogProps) {
  const { mutateAsync: deleteUser } = useDeleteUser();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await deleteUser(user.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Deactivate User"
      description={`Are you sure you want to deactivate "${user?.name}"? They will lose access to the system, but their data will be preserved.`}
      confirmText="Deactivate"
      variant="danger"
      loading={loading}
    />
  );
}
