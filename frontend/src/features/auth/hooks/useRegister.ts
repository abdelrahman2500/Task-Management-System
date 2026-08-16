import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authServices } from "../api/auth.service";
import { authKeys } from "../constants/authKeys";
import { handleApiError } from "../../../shared/utils/errorHandling";
import type { RegisterRequest } from "../types";

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authServices.register(payload),

    onSuccess: () => {
      // Bust the current-user cache so ProtectedRoute re-fetches with the new token
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Account created successfully!");
      navigate("/", { replace: true });
    },

    onError: (error: unknown) => {
      const message = handleApiError(error, "signup");
      toast.error(message);
    },
  });
}
