import type { Project } from "../types";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export default function ProjectGrid({ projects, onEdit }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
}
