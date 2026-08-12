// Import UserRole to ensure single definition in code review
// Note: This type is also in auth/types and generated types (all should be identical)
export type UserRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type Resource = "users" | "projects" | "tasks" | "settings" | "profile";

export type Action = "create" | "read" | "update" | "delete" | "manage";

export interface PermissionContext {
  ownerId?: number;
  currentUserId?: number;
  projectMemberRole?: string;
  assigneeId?: number;
  fields?: string[];
  [key: string]: unknown;
}

export interface PermissionUser {
  id: number;
  role?: UserRole;
  isActive?: boolean;
}

function isSelf(
  user: PermissionUser,
  context: PermissionContext | undefined,
): boolean {
  if (!context) return false;
  // User can act on their own record - check if the target (ownerId) is themselves
  return context.ownerId === user.id;
}

const ADMIN_ROLES: UserRole[] = ["OWNER", "ADMIN"];

export function can(
  user: PermissionUser | undefined | null,
  action: Action,
  resource: Resource,
  context?: PermissionContext,
): boolean {
  if (!user || user.isActive === false || !user.role) return false;

  const isAdmin = ADMIN_ROLES.includes(user.role);

  // Handle "manage" action - typically admin-only
  if (action === "manage") {
    return isAdmin;
  }

  switch (resource) {
    case "users":
      switch (action) {
        case "create":
        case "delete":
          return isAdmin;
        case "read":
          return true; // Any active user can read users
        case "update":
          return isAdmin || isSelf(user, context);
      }
      break;

    case "projects":
      switch (action) {
        case "create":
          return true; // Any active user can create projects
        case "read":
          return true;
        case "update":
        case "delete":
          return isAdmin || isSelf(user, context);
      }
      break;

    case "tasks":
      const projectRole = context?.projectMemberRole;
      switch (action) {
        case "create":
        case "update":
          if (isAdmin) return true;
          return (
            projectRole === "OWNER" ||
            projectRole === "ADMIN" ||
            projectRole === "MEMBER"
          );
        case "read":
          return true;
        case "delete":
          if (isAdmin) return true;
          return projectRole === "OWNER" || projectRole === "ADMIN";
      }
      break;

    case "settings":
    case "profile":
      return isSelf(user, context) || isAdmin;
  }

  return false;
}
