import type { Role } from "@prisma/client";
import type { SafeUser } from "../repositories/auth.repository.js";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/app-error.js";

export type Action = "read" | "create" | "update" | "delete" | "manage";

export type Resource =
  | "users"
  | "profile"
  | "projects"
  | "tasks"
  | "settings"
  | "comments";

interface CanOptions {
  ownerId?: number;
  projectId?: number;
  projectMemberRole?: Role;
}

const GLOBAL_ADMIN_ROLES: Role[] = ["OWNER", "ADMIN"];
const PROJECT_WRITE_ROLES: Role[] = ["OWNER", "ADMIN", "MEMBER"];
const PROJECT_ANY_ROLE: Role[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];

function isGlobalAdmin(user: SafeUser): boolean {
  return GLOBAL_ADMIN_ROLES.includes(user.role);
}

export function can(
  user: SafeUser,
  action: Action,
  resource: Resource,
  opts: CanOptions = {},
): boolean {
  if (!user.isActive) return false;

  switch (resource) {
    case "users": {
      switch (action) {
        case "manage":
          return isGlobalAdmin(user);
        case "read":
          return true;
        case "update":
        case "delete": {
          if (opts.ownerId !== undefined && user.id === opts.ownerId) {
            return true;
          }
          return isGlobalAdmin(user);
        }
        default:
          return false;
      }
    }

    case "profile": {
      if (opts.ownerId !== undefined && user.id === opts.ownerId) {
        return true;
      }
      return false;
    }

    case "settings": {
      if (opts.ownerId !== undefined && user.id === opts.ownerId) {
        return true;
      }
      return false;
    }

    case "projects": {
      switch (action) {
        case "read": {
          if (isGlobalAdmin(user)) return true;
          if (opts.ownerId !== undefined && user.id === opts.ownerId) return true;
          if (opts.projectMemberRole && PROJECT_ANY_ROLE.includes(opts.projectMemberRole)) {
            return true;
          }
          return false;
        }
        case "create":
          return true;
        case "update":
        case "delete": {
          if (isGlobalAdmin(user)) return true;
          if (opts.projectMemberRole === "OWNER") return true;
          if (opts.ownerId !== undefined && user.id === opts.ownerId) return true;
          return false;
        }
        default:
          return false;
      }
    }

    case "tasks": {
      switch (action) {
        case "read": {
          if (isGlobalAdmin(user)) return true;
          if (opts.projectMemberRole && PROJECT_ANY_ROLE.includes(opts.projectMemberRole)) {
            return true;
          }
          if (opts.ownerId !== undefined && user.id === opts.ownerId) return true;
          return false;
        }
        case "create":
        case "update": {
          if (isGlobalAdmin(user)) return true;
          if (opts.projectMemberRole && PROJECT_WRITE_ROLES.includes(opts.projectMemberRole)) {
            return true;
          }
          return false;
        }
        case "delete": {
          if (isGlobalAdmin(user)) return true;
          if (opts.projectMemberRole === "OWNER" || opts.projectMemberRole === "ADMIN") {
            return true;
          }
          return false;
        }
        default:
          return false;
      }
    }

    case "comments": {
      switch (action) {
        case "read": {
          if (isGlobalAdmin(user)) return true;
          if (opts.projectMemberRole && PROJECT_ANY_ROLE.includes(opts.projectMemberRole)) {
            return true;
          }
          return false;
        }
        case "create":
        case "update": {
          if (isGlobalAdmin(user)) return true;
          if (opts.projectMemberRole && PROJECT_WRITE_ROLES.includes(opts.projectMemberRole)) {
            return true;
          }
          if (opts.ownerId !== undefined && user.id === opts.ownerId) return true;
          return false;
        }
        case "delete": {
          if (isGlobalAdmin(user)) return true;
          if (opts.projectMemberRole === "OWNER" || opts.projectMemberRole === "ADMIN") {
            return true;
          }
          if (opts.ownerId !== undefined && user.id === opts.ownerId) return true;
          return false;
        }
        default:
          return false;
      }
    }

    default:
      return false;
  }
}

const FORBIDDEN_MSG = "You do not have permission to perform this action.";

export function requireAdmin() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const user = res.req.user;
    if (!user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication is required."));
    }
    if (!isGlobalAdmin(user)) {
      return next(new AppError(403, "FORBIDDEN", FORBIDDEN_MSG));
    }
    return next();
  };
}

export function requireSelfOrAdmin(userIdParamName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication is required."));
    }

    const targetIdRaw = req.params[userIdParamName];
    if (targetIdRaw === undefined) {
      return next(new AppError(400, "MISSING_PARAM", `Missing parameter: ${userIdParamName}`));
    }

    const targetId = parseInt(String(targetIdRaw), 10);
    if (isNaN(targetId)) {
      return next(new AppError(400, "INVALID_ID", `Invalid ${userIdParamName} parameter.`));
    }

    if (user.id === targetId) {
      return next();
    }

    if (isGlobalAdmin(user)) {
      return next();
    }

    return next(new AppError(403, "FORBIDDEN", FORBIDDEN_MSG));
  };
}
