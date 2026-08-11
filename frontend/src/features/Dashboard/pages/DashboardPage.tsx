import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Clock3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useProjects } from "../../projects/hooks/useProjects";
import { useTasks } from "../../tasks/hooks/useTasks";
import { Card } from "../../../shared/components/ui/Card";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { Badge } from "../../../shared/components/ui/Badge";
import {
  statusPresentation,
  priorityPresentation,
} from "../../tasks/constants/taskPresentation";

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`rounded-lg p-2 ${colorClass}`}>
          <Icon size={18} />
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    page: 1,
    limit: 100,
  });
  const { data: tasksData, isLoading: tasksLoading } = useTasks({
    page: 1,
    limit: 100,
  });

  const projects = projectsData?.data ?? [];
  const tasks = tasksData?.data ?? [];

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const urgentTasks = tasks.filter(
    (t) => t.priority === "URGENT" && t.status !== "DONE",
  );

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          {greeting()},{" "}
          <span className="text-blue-600">{currentUser?.name ?? "..."}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening across your projects today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={activeProjects}
          icon={FolderKanban}
          colorClass="bg-blue-100 text-blue-700"
          isLoading={projectsLoading}
        />
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          icon={CheckSquare}
          colorClass="bg-slate-100 text-slate-700"
          isLoading={tasksLoading}
        />
        <StatCard
          label="In Progress"
          value={inProgressTasks}
          icon={Clock3}
          colorClass="bg-amber-100 text-amber-700"
          isLoading={tasksLoading}
        />
        <StatCard
          label="Completed"
          value={doneTasks}
          icon={CheckCircle2}
          colorClass="bg-green-100 text-green-700"
          isLoading={tasksLoading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent tasks */}
        <Card className="p-6 rounded-xl shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No tasks yet.{" "}
              <Link to="/tasks" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentTasks.map((task) => {
                const status = statusPresentation[task.status];
                const priority = priorityPresentation[task.priority];
                return (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                      {task.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Recent projects */}
        <Card className="p-6 rounded-xl shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {projectsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No projects yet.{" "}
              <Link to="/projects" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {recentProjects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {project.name}
                    </p>
                    {project.description && (
                      <p className="truncate text-xs text-slate-500">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      project.status === "ACTIVE"
                        ? "success"
                        : project.status === "COMPLETED"
                          ? "info"
                          : "default"
                    }
                    size="sm"
                  >
                    {project.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Urgent tasks callout */}
      {!tasksLoading && urgentTasks.length > 0 && (
        <Card className="p-6 rounded-xl border-red-200 bg-red-50 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-100 p-2 text-red-600 shrink-0">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-red-900">
                {urgentTasks.length} urgent task
                {urgentTasks.length !== 1 ? "s" : ""} need attention
              </h2>
              <ul className="mt-2 space-y-1">
                {urgentTasks.slice(0, 3).map((t) => (
                  <li key={t.id} className="truncate text-sm text-red-700">
                    • {t.title}
                  </li>
                ))}
                {urgentTasks.length > 3 && (
                  <li className="text-sm text-red-600">
                    +{urgentTasks.length - 3} more…
                  </li>
                )}
              </ul>
            </div>
            <Link
              to="/tasks"
              className="shrink-0 text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-1"
            >
              Review <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
