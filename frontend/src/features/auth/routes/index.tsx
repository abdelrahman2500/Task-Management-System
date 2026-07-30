import LoginPage from "../pages/LoginPage.tsx";

import AuthLayout from "../../../layouts/AuthLayout.tsx";
import type { RouteObject } from "react-router-dom";

export const authRoutes: RouteObject[] = [
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
];
