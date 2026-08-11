import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { tokenStorage } from "../utils/token-storage";
import { Spinner } from "./ui/Spinner";

export default function ProtectedRoute() {
  const location = useLocation();
  const hasToken = !!tokenStorage.getAccessToken();
  const { data: user, isLoading, isError } = useCurrentUser();

  // No token at all — skip the fetch and redirect immediately
  if (!hasToken) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  // Token exists but we're still resolving the user
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="xl" />
      </div>
    );
  }

  // 401 or user is inactive
  const isAuthenticated = !isError && !!user && user.isActive !== false;
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
