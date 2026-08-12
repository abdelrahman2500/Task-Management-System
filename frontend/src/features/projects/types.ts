import type {
  Project as GeneratedProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  ListProjectsParams,
  PaginationMetadata,
  ProjectsResponse,
} from "../../../shared/api/generated/types";

/**
 * Project Status Enum
 *
 * CRITICAL: Must match backend OpenAPI spec
 * Backend only supports "active" and "archived" (lowercase)
 * "COMPLETED" is not a valid backend status
 */
export type ProjectStatus = "active" | "archived";

export type {
  CreateProjectRequest,
  UpdateProjectRequest,
  ListProjectsParams,
  PaginationMetadata,
};
export type { ProjectsResponse as ListProjectsResponse }; // Backwards compat alias

/**
 * Project with optional metadata counts
 * Extends generated Project to include _count if the API returns it
 */
export interface Project extends GeneratedProject {
  _count?: { members: number; tasks: number };
}
