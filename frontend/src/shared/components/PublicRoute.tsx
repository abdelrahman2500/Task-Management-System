import { Navigate, Outlet } from "react-router-dom";
import { tokenStorage } from "../utils/token-storage";

export default function PublicRoute() {
  const token = tokenStorage.getAccessToken();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
