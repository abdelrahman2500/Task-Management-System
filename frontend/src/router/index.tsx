import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import PublicRoute from "../shared/components/PublicRoute";

// Auth
import { authRoutes } from "../features/auth/routes";

// Pages
import DashboardPage from "../features/Dashboard/pages/DashboardPage";
import ProjectsPage from "../features/projects/pages/ProjectsPage";
import { TasksPage } from "../features/tasks/pages/TasksPage";
import UsersPage from "../features/users/pages/UsersPage";
import UserDetailPage from "../features/users/pages/UserDetailPage";

// Settings
import SettingsPage from "../features/settings/pages/SettingsPage";
import { ProfileSettings } from "../features/settings/components/ProfileSettings";
import { SecuritySettings } from "../features/settings/components/SecuritySettings";
import { PreferencesSettings } from "../features/settings/components/PreferencesSettings";
import { AccountSettings } from "../features/settings/components/AccountSettings";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "users", element: <UsersPage /> },
          { path: "users/:userId", element: <UserDetailPage /> },
          {
            path: "settings",
            element: <SettingsPage />,
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: "profile", element: <ProfileSettings /> },
              { path: "account", element: <AccountSettings /> },
              { path: "security", element: <SecuritySettings /> },
              { path: "preferences", element: <PreferencesSettings /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: authRoutes,
  },
]);

export default router;
