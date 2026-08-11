import { useState } from "react";
import CreateTaskModal from "../components/CreateTaskModal";
import DeleteTaskDialog from "../components/DeleteTaskDialog";
import EditTaskModal from "../components/EditTaskModal";
import { TaskDetailsDialog } from "../components/TaskDetailsDialog";
import { TaskEmptyState } from "../components/TaskEmptyState";
import { TaskErrorState } from "../components/TaskErrorState";
import { TaskFilters } from "../components/TaskFilters";
import { TaskPagination } from "../components/TaskPagination";
import { TaskSkeleton } from "../components/TaskSkeleton";
import { TaskStats } from "../components/TaskStats";
import { TaskTable } from "../components/TaskTable";
import TasksHeader from "../components/TasksHeader";
import { useTasks } from "../hooks/useTasks";
import type { GetTasksParams, Task } from "../types";

const PAGE_SIZE = 10;

export function TasksPage() {
  const [filters, setFilters] = useState<GetTasksParams>({
    page: 1,
    limit: PAGE_SIZE,
  });

  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useTasks(filters);

  const tasks = response?.data ?? [];
  const total = response?.total ?? 0;
  const page = response?.page ?? filters.page ?? 1;
  const pageCount = response?.totalPages ?? 1;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [detailsTaskId, setDetailsTaskId] = useState<number | null>(null);

  const hasFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.projectId,
  );

  const clearFilters = () => setFilters({ page: 1, limit: PAGE_SIZE });

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };
  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };
  const handleView = (task: Task) => setDetailsTaskId(task.id);
  const closeEdit = () => {
    setIsEditOpen(false);
    setSelectedTask(null);
  };
  const closeDelete = () => {
    setIsDeleteOpen(false);
    setSelectedTask(null);
  };
  const handleEditFromDetails = (task: Task) => {
    setDetailsTaskId(null);
    handleEdit(task);
  };
  const handleDeleteFromDetails = (task: Task) => {
    setDetailsTaskId(null);
    handleDelete(task);
  };

  return (
    <>
      <TasksHeader onCreate={() => setIsCreateOpen(true)} />

      {!isLoading && !isError && <TaskStats tasks={tasks} />}

      <TaskFilters filters={filters} onChange={setFilters} />

      {isLoading && <TaskSkeleton />}

      {isError && (
        <TaskErrorState
          isRetrying={isFetching}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <TaskEmptyState
          hasFilters={hasFilters}
          onCreate={() => setIsCreateOpen(true)}
          onClearFilters={clearFilters}
        />
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <>
          <TaskTable
            tasks={tasks}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <TaskPagination
            page={page}
            pageCount={pageCount}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={(nextPage) =>
              setFilters((prev) => ({ ...prev, page: nextPage }))
            }
          />
        </>
      )}

      <CreateTaskModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <EditTaskModal
        open={isEditOpen}
        task={selectedTask}
        onClose={closeEdit}
      />
      <DeleteTaskDialog
        open={isDeleteOpen}
        task={selectedTask}
        onClose={closeDelete}
      />
      <TaskDetailsDialog
        open={detailsTaskId !== null}
        taskId={detailsTaskId}
        onClose={() => setDetailsTaskId(null)}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />
    </>
  );
}
