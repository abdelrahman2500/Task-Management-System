import {
  CalendarDays,
  Flag,
  FolderKanban,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import Dialog from "../../../shared/components/ui/Dialog/Dialog";
import { useProjects } from "../../projects/hooks/useProjects";
import {
  priorityPresentation,
  statusPresentation,
} from "../constants/taskPresentation";
import { useTask } from "../hooks/useTask";
import type { Task } from "../types";

interface TaskDetailsDialogProps {
  open: boolean;
  taskId: number | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function DetailSkeleton() {
  return (
    <div aria-label="Loading task details" className="animate-pulse space-y-5">
      <div className="h-5 w-36 rounded bg-slate-200" />
      <div className="h-7 w-3/4 rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-16 rounded-lg bg-slate-100" />
        <div className="h-16 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function TaskDetailsDialog({
  open,
  taskId,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailsDialogProps) {
  const {
    data: task,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useTask(taskId);
  const { data: projectsData } = useProjects({ limit: 100 });
  const projects = projectsData?.data ?? [];

  if (!taskId) return null;

  if (isLoading)
    return (
      <Dialog open={open} title="Task details" onClose={onClose}>
        <DetailSkeleton />
      </Dialog>
    );

  if (isError) {
    return (
      <Dialog open={open} title="Task details" onClose={onClose}>
        <div role="alert" className="space-y-4 text-center">
          <p className="font-medium text-slate-900">
            We couldn’t load this task.
          </p>
          <p className="text-sm text-slate-500">
            It may have been removed or there was a connection problem.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="w-auto" onClick={onClose}>
              Close
            </Button>
            <Button
              className="w-auto"
              loading={isFetching}
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  if (!task)
    return (
      <Dialog open={open} title="Task details" onClose={onClose}>
        <div className="space-y-4 text-center">
          <p className="font-medium text-slate-900">Task not found</p>
          <p className="text-sm text-slate-500">
            This task is no longer available.
          </p>
          <Button variant="outline" className="w-auto" onClick={onClose}>
            Close
          </Button>
        </div>
      </Dialog>
    );

  const status = statusPresentation[task.status];
  const priority = priorityPresentation[task.priority];
  const projectName =
    projects?.find((project) => project.id === task.projectId)?.name ??
    `Project #${task.projectId}`;
  const details = [
    {
      label: "Assignee",
      value: task.assigneeId ? `#${task.assigneeId}` : "Unassigned",
      icon: UserRound,
    },
    { label: "Project", value: projectName, icon: FolderKanban },
    {
      label: "Created",
      value: dateFormatter.format(new Date(task.createdAt)),
      icon: CalendarDays,
    },
    {
      label: "Due date",
      value: task.dueDate
        ? dateFormatter.format(new Date(task.dueDate))
        : "No due date",
      icon: CalendarDays,
    },
  ];

  return (
    <Dialog open={open} title="Task details" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium ${priority.className}`}
            >
              <Flag size={12} />
              {priority.label}
            </span>
          </div>
          <h3 className="mt-3 break-words text-xl font-semibold text-slate-900">
            {task.title}
          </h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
            {task.description || "No description provided."}
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {details.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 break-all text-sm font-medium text-slate-800">
                <Icon size={15} className="shrink-0 text-slate-400" />
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button
            variant="danger"
            className="w-full sm:w-auto"
            onClick={() => onDelete(task)}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => onEdit(task)}>
            <Pencil size={16} className="mr-2" />
            Edit task
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
