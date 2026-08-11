import { TaskRepository } from "../repositories/task.repository.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { Role, TaskStatus, TaskPriority } from "@prisma/client";
import { AppError } from "../utils/errors/app-error.js";
import type { SafeUser } from "../repositories/auth.repository.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from "../schemas/task.schema.js";

const GLOBAL_ADMIN_ROLES: Role[] = [Role.OWNER, Role.ADMIN];
const TASK_CREATE_ROLES: Role[] = [Role.OWNER, Role.ADMIN, Role.MEMBER];
const TASK_UPDATE_ROLES: Role[] = [Role.OWNER, Role.ADMIN, Role.MEMBER];
const TASK_DELETE_ROLES: Role[] = [Role.OWNER, Role.ADMIN];

export class TaskService {
  constructor(
    private repository = new TaskRepository(),
    private projectRepository = new ProjectRepository(),
  ) {}

  private isGlobalAdmin(user: SafeUser): boolean {
    return GLOBAL_ADMIN_ROLES.includes(user.role);
  }

  private async resolveEffectiveProjectRole(
    currentUser: SafeUser,
    project: { ownerId: number; id: number },
  ): Promise<Role | null> {
    if (project.ownerId === currentUser.id) {
      return Role.OWNER;
    }
    const membership = await this.projectRepository.getMember(
      project.id,
      currentUser.id,
    );
    return membership?.role ?? null;
  }

  async listTasks(currentUser: SafeUser, query: ListTasksQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const userId = this.isGlobalAdmin(currentUser) ? undefined : currentUser.id;

    return this.repository.findAllPaginated({
      page,
      limit,
      search: query.search,
      status: query.status,
      priority: query.priority,
      projectId: query.projectId,
      assigneeId: query.assigneeId,
      userId,
    });
  }

  async getTaskById(currentUser: SafeUser, taskId: number) {
    const task = await this.repository.findByIdWithProject(taskId);
    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    const role = await this.resolveEffectiveProjectRole(currentUser, {
      ownerId: task.project.ownerId,
      id: task.projectId,
    });

    if (!this.isGlobalAdmin(currentUser) && role === null) {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this task");
    }

    return this.repository.findByIdWithDetails(taskId);
  }

  async createTask(currentUser: SafeUser, data: CreateTaskInput) {
    const project = await this.projectRepository.findByIdWithDetails(data.projectId);
    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const role = await this.resolveEffectiveProjectRole(currentUser, {
      ownerId: project.ownerId,
      id: project.id,
    });

    if (this.isGlobalAdmin(currentUser)) {
      // Global admins can create tasks anywhere
    } else if (role === null || !TASK_CREATE_ROLES.includes(role)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to create tasks in this project",
      );
    }

    if (data.assigneeId !== undefined && data.assigneeId !== null) {
      const assigneeValid = await this.repository.verifyAssigneeBelongsToProject(
        data.assigneeId,
        data.projectId,
      );
      if (!assigneeValid) {
        throw new AppError(
          400,
          "INVALID_ASSIGNEE",
          "Assignee must be a member of the project",
        );
      }
    }

    return this.repository.create({
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status ?? TaskStatus.TODO,
      priority: data.priority ?? TaskPriority.MEDIUM,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdBy: currentUser.id,
    });
  }

  async updateTask(
    currentUser: SafeUser,
    taskId: number,
    data: UpdateTaskInput,
  ) {
    const task = await this.repository.findByIdWithProject(taskId);
    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    const role = await this.resolveEffectiveProjectRole(currentUser, {
      ownerId: task.project.ownerId,
      id: task.projectId,
    });

    if (!this.isGlobalAdmin(currentUser)) {
      if (role === null) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "You do not have access to this task",
        );
      }
      if (role === Role.VIEWER) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "Viewers cannot update tasks",
        );
      }
      if (!TASK_UPDATE_ROLES.includes(role)) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to update this task",
        );
      }
    }

    const targetProjectId = data.projectId ?? task.projectId;

    if (data.assigneeId !== undefined && data.assigneeId !== null) {
      const assigneeValid = await this.repository.verifyAssigneeBelongsToProject(
        data.assigneeId,
        targetProjectId,
      );
      if (!assigneeValid) {
        throw new AppError(
          400,
          "INVALID_ASSIGNEE",
          "Assignee must be a member of the project",
        );
      }
    }

    if (data.projectId !== undefined && data.projectId !== task.projectId) {
      const newProject = await this.projectRepository.findByIdWithDetails(data.projectId);
      if (!newProject) {
        throw new AppError(404, "PROJECT_NOT_FOUND", "Target project not found");
      }
      const newRole = await this.resolveEffectiveProjectRole(currentUser, {
        ownerId: newProject.ownerId,
        id: newProject.id,
      });
      if (!this.isGlobalAdmin(currentUser) && (newRole === null || !TASK_UPDATE_ROLES.includes(newRole))) {
        throw new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to move tasks to the target project",
        );
      }
    }

    return this.repository.update(taskId, {
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
    });
  }

  async deleteTask(currentUser: SafeUser, taskId: number) {
    const task = await this.repository.findByIdWithProject(taskId);
    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    const role = await this.resolveEffectiveProjectRole(currentUser, {
      ownerId: task.project.ownerId,
      id: task.projectId,
    });

    if (this.isGlobalAdmin(currentUser)) {
      // OK
    } else if (role === null || !TASK_DELETE_ROLES.includes(role)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to delete this task",
      );
    }

    await this.repository.deleteWithComments(taskId);
  }
}
