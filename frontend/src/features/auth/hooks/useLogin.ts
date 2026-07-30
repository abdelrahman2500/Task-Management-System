import { useMutation } from "@tanstack/react-query";
import { authServices } from "../api/auth.service";
import { toast } from "react-hot-toast";

export function useLogin(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: authServices.login,

    onSuccess() {
      toast.success("Welcome back!");
      options?.onSuccess?.();
    },

    onError(error: any) {
      console.dir(error);

      toast.error(error?.response?.data?.message ?? "Login failed");
    },
  });
}
