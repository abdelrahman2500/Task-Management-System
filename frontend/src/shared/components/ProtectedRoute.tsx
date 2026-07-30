import { Navigate, Outlet } from "react-router-dom";
import { tokenStorage } from "../utils/token-storage";

export default function ProtectedRoute() {
  const accessToken = tokenStorage.getAccessToken();

  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
