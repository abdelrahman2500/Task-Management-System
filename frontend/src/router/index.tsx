import { createBrowserRouter } from "react-router-dom";
import ProjectsPage from "../features/projects/pages/ProjectsPage";
import MainLayout from "../layouts/MainLayout.tsx";
import { TasksPage } from "../features/tasks/pages/TasksPage";
import { authRoutes } from "../features/auth/routes";
import ProtectedRoute from "../shared/components/ProtectedRoute.tsx";
import PublicRoute from "../shared/components/PublicRoute.tsx";
import DashboardPage from "../features/Dashboard/pages/DashboardPage.tsx";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "projects",
            element: <ProjectsPage />,
          },
          {
            path: "tasks",
            element: <TasksPage />,
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
