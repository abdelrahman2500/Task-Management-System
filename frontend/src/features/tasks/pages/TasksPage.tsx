import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { TaskSkeleton } from "../components/TaskSkeleton";
import { EmptyTasks } from "../components/EmptyTasks";
import TaskList from "../components/TaskList";
import TasksHeader from "../components/TasksHeader";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import DeleteTaskDialog from "../components/DeleteTaskDialog";
import type { Task, GetTasksParams } from "../types";

export function TasksPage() {
  // ─── Filter state (drives the query key) ───────────────────────────────────
  const [filters, setFilters] = useState<GetTasksParams>({});

  // ─── Data ──────────────────────────────────────────────────────────────────
  const { data: tasks, isLoading, isError } = useTasks(filters);

  // ─── Modal state ───────────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <TasksHeader
        filters={filters}
        onFilterChange={setFilters}
        onCreate={() => setIsCreateOpen(true)}
      />

      {/* Loading */}
      {isLoading && <TaskSkeleton />}

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-600">
            Something went wrong. Please try again.
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && !tasks?.length && (
        <EmptyTasks onCreate={() => setIsCreateOpen(true)} />
      )}

      {/* Tasks grid */}
      {!isLoading && !isError && !!tasks?.length && (
        <TaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Modals */}
      <CreateTaskModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditTaskModal open={isEditOpen} task={selectedTask} onClose={closeEdit} />

      <DeleteTaskDialog
        open={isDeleteOpen}
        task={selectedTask}
        onClose={closeDelete}
      />
    </>
  );
}
