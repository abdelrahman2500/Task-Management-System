import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authServices } from "../api/auth.service";
import { authKeys } from "../constants/authKeys";
import type { LoginRequest } from "../types";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authServices.login(payload),

    onSuccess: () => {
      // Bust the current-user cache so ProtectedRoute re-fetches with the new token
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Welcome back!");
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Invalid email or password";
      toast.error(message);
    },
  });
}
