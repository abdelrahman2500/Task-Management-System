import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authServices } from "../api/auth.service";
import { authKeys } from "../constants/authKeys";
import toast from "react-hot-toast";

export function useLogout(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      authServices.logout();
    },
    onSuccess() {
      // Remove all cached queries so stale data doesn't linger
      queryClient.clear();
      toast.success("Logged out successfully.");
      navigate("/auth/login", { replace: true });
      options?.onSuccess?.();
    },
    onError() {
      // Logout is local-only (stateless JWT), so errors should not happen.
      // Fail safe: still clear and redirect.
      queryClient.removeQueries({ queryKey: authKeys.all });
      navigate("/auth/login", { replace: true });
    },
  });
}
