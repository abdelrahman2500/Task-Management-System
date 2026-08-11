import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { tokenStorage } from "../utils/token-storage";
import { Spinner } from "./ui/Spinner";

export default function PublicRoute() {
  const hasToken = !!tokenStorage.getAccessToken();
  const { data: user, isLoading } = useCurrentUser();

  // No token — definitely unauthenticated, show the public page
  if (!hasToken) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="xl" />
      </div>
    );
  }

  // Token valid and user loaded — redirect into the app
  if (user?.isActive) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
