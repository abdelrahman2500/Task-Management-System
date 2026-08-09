import { useState } from "react";
import { EmptyProjects } from "../components/EmptyProjects";
import ProjectGrid from "../components/ProjectGrid";
import { ProjectSkeleton } from "../components/ProjectSkeleton";
import { useProjects } from "../hooks/useProjects";
import ProjectsHeader from "../components/ProjectsHeader";
import CreateProjectModal from "../components/CreateProjectModal";
import type { Project } from "../types";
import EditProjectModal from "../components/EditProjectModal";
import DeleteProjectDialog from "../components/DeleteProjectDialog";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const [open, setOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    const project = projects?.find((p) => p.id === id);
    setSelectedProject(project ?? null);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <ProjectSkeleton />;
  }

  if (isError) {
    return <div>Something went wrong.</div>;
  }

  if (!projects?.length) {
    return (
      <>
        <ProjectsHeader onCreate={() => setOpen(true)} />
        <CreateProjectModal open={open} onClose={() => setOpen(false)} />
        <EmptyProjects />;
      </>
    );
  }

  return (
    <>
      <ProjectsHeader onCreate={() => setOpen(true)} />
      <CreateProjectModal open={open} onClose={() => setOpen(false)} />
      <ProjectGrid
        projects={projects}
        onEdit={handleEdit}
        onDelete={(id) => handleDelete(id)}
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
