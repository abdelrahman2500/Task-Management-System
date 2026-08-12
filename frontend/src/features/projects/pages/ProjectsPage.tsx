import { useState } from "react";
import { EmptyProjects } from "../components/EmptyProjects";
import ProjectGrid from "../components/ProjectGrid";
import { ProjectSkeleton } from "../components/ProjectSkeleton";
import { useProjects } from "../hooks/useProjects";
import ProjectsHeader from "../components/ProjectsHeader";
import CreateProjectModal from "../components/CreateProjectModal";
import type { ListProjectsParams, Project } from "../types";
import EditProjectModal from "../components/EditProjectModal";
import DeleteProjectDialog from "../components/DeleteProjectDialog";
import { Pagination } from "../../../shared/components/ui/Pagination";
import { ErrorState } from "../../../shared/components/ui/ErrorState";

const PAGE_SIZE = 12;

export default function ProjectsPage() {
  const [params, setParams] = useState<ListProjectsParams>({
    page: 1,
    limit: PAGE_SIZE,
  });
  const { data, isLoading, isError, refetch, isFetching } = useProjects(params);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    const project = data?.data.find((p) => p.id === id);
    setSelectedProject((project ?? null) as Project | null);
    setIsDeleteOpen(true);
  };

  if (isLoading) return <ProjectSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load projects"
        description="There was a problem fetching your projects. Please try again."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const projects = (data?.data ?? []) as Project[];
  const pagination = data?.pagination;

  return (
    <>
      <ProjectsHeader onCreate={() => setIsCreateOpen(true)} />

      {projects.length === 0 ? (
        <EmptyProjects onCreateProject={() => setIsCreateOpen(true)} />
      ) : (
        <>
          <ProjectGrid
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={PAGE_SIZE}
              onPageChange={(page: number) =>
                setParams((p: ListProjectsParams) => ({ ...p, page }))
              }
              className="mt-6"
            />
          )}
        </>
      )}

      <CreateProjectModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <EditProjectModal
        open={isEditOpen}
        project={selectedProject}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedProject(null);
        }}
      />
      <DeleteProjectDialog
        open={isDeleteOpen}
        projectId={selectedProject?.id ?? null}
        projectName={selectedProject?.name ?? ""}
        onClose={() => {
          setSelectedProject(null);
          setIsDeleteOpen(false);
        }}
      />
    </>
  );
}
