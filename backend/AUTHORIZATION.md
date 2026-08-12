# Authorization and Access Control

## Overview

This document describes the authorization strategy for the Task Management System. All access control is centralized in `backend/src/lib/authorization.ts`.

## Role Hierarchy

Roles are organized in a hierarchy:

- **OWNER**: Full project control (implicit for project creators)
- **ADMIN**: Can manage tasks and members, update project
- **MEMBER**: Can create tasks, comment, participate in project
- **VIEWER**: Read-only access

## Permission Matrix

| Resource      | Owner | Admin | Member | Viewer | Non-Member |
| ------------- | ----- | ----- | ------ | ------ | ---------- |
| **Project**   |       |       |        |        |            |
| Read          | ✅    | ✅    | ✅     | ✅     | ❌         |
| Update        | ✅    | ✅    | ❌     | ❌     | ❌         |
| Delete        | ✅    | ❌    | ❌     | ❌     | ❌         |
| List Members  | ✅    | ✅    | ✅     | ✅     | ❌         |
| Add Member    | ✅    | ✅    | ❌     | ❌     | ❌         |
| Update Member | ✅    | ✅    | ❌     | ❌     | ❌         |
| Remove Member | ✅    | ✅    | ❌     | ❌     | ❌         |
| **Tasks**     |       |       |        |        |            |
| List          | ✅    | ✅    | ✅     | ✅     | ❌         |
| Read          | ✅    | ✅    | ✅     | ✅     | ❌         |
| Create        | ✅    | ✅    | ✅     | ❌     | ❌         |
| Update Own    | ✅    | ✅    | ✅     | ❌     | ❌         |
| Update Any    | ✅    | ✅    | ❌     | ❌     | ❌         |
| Delete Own    | ✅    | ✅    | ✅     | ❌     | ❌         |
| Delete Any    | ✅    | ✅    | ❌     | ❌     | ❌         |
| **Comments**  |       |       |        |        |            |
| List          | ✅    | ✅    | ✅     | ✅     | ❌         |
| Create        | ✅    | ✅    | ✅     | ✅     | ❌         |
| Update Own    | ✅    | ✅    | ✅     | ✅     | ❌         |
| Update Other  | ❌    | ❌    | ❌     | ❌     | ❌         |
| Delete Own    | ✅    | ✅    | ✅     | ✅     | ❌         |
| Delete Other  | ✅    | ✅    | ❌     | ❌     | ❌         |

## Authorization Functions

### Project Access

**`assertProjectAccess(projectId, userId)`**

- Checks if user can access a project
- Returns: None (throws if unauthorized)
- Allows: Project owner, project members

**`assertProjectRole(projectId, userId, allowedRoles[])`**

- Checks if user has specific roles in a project
- Parameters:
  - `projectId`: Project ID
  - `userId`: User ID
  - `allowedRoles`: Array of allowed roles (e.g., ["admin", "owner"])
- Returns: None (throws if unauthorized)

**`assertProjectAdmin(projectId, userId)`**

- Checks if user is project owner or admin
- Used for: Managing tasks, members, updating project

**`assertProjectOwner(projectId, userId)`**

- Checks if user is project owner
- Used for: Deleting project, critical changes

**`assertProjectMember(projectId, userId)`**

- Checks if user can perform member-level actions
- Returns: None (throws if user is viewer or non-member)
- Used for: Creating tasks

### Task Access

**`assertTaskAccess(taskId, userId)`**

- Checks if user can access a task through project membership
- Returns: None (throws if unauthorized)

**`assertTaskModifyAccess(taskId, userId)`**

- Checks if user can modify a task
- Allows: Task creator, assigned user, project admins

**`assertTaskDeleteAccess(taskId, userId)`**

- Checks if user can delete a task
- Allows: Task creator, project admins

### Comment Access

**`assertCommentAccess(commentId, userId)`**

- Checks if user can access a comment through task/project membership
- Returns: None (throws if unauthorized)

**`assertCommentModifyAccess(commentId, userId)`**

- Checks if user can modify a comment
- Allows: Comment author only

**`assertCommentDeleteAccess(commentId, userId)`**

- Checks if user can delete a comment
- Allows: Comment author, project admins

## Security Requirements Met

✅ Unauthenticated users cannot access protected project resources

- All protected endpoints require JWT authentication middleware

✅ Authenticated users cannot access projects they are not members of

- `assertProjectAccess` checks project membership for every operation

✅ Users cannot modify projects without sufficient permission

- `assertProjectAdmin` required for updates

✅ Users cannot delete projects without sufficient permission

- `assertProjectOwner` required for deletions

✅ Users cannot access tasks belonging to unauthorized projects

- Task access checked through `assertTaskAccess` → `assertProjectAccess`

✅ Users cannot access comments belonging to unauthorized projects

- Comment access checked through `assertCommentAccess` → `assertTaskAccess`

✅ Users cannot manipulate another project's data by changing projectId in request

- Project ID extracted from database, not from client request

✅ Never trust projectId from the client without checking access

- All services extract projectId from database records

✅ Never trust role information sent by the frontend

- Roles stored server-side in `ProjectMember` table, validated from database

✅ Role must come from authenticated server-side data

- All authorization checks query database for current role and membership

✅ Proper HTTP status codes

- 401: Unauthenticated (handled by auth middleware)
- 403: Authenticated but forbidden (thrown by authorization functions)
- 404: Resource does not exist (thrown by NotFoundError)

## Architecture

### Authorization Flow

```
Request
  ↓
Authentication Middleware (checks JWT token)
  ↓
Authenticated User ID extracted
  ↓
Controller (receives projectId from URL parameter)
  ↓
Service Function (gets resource from database)
  ↓
Authorization Check (using authorization.ts functions)
  ↓
Database Operation (if authorized)
```

### Information Disclosure

The system uses 404 responses for both:

- Resource does not exist
- Resource exists but user has no access (forbidden)

This prevents information disclosure about private resources.

## Implementation Details

### Centralized Authorization

All authorization logic is in `backend/src/lib/authorization.ts`. This ensures:

- Single source of truth for access control
- Consistent authorization across all services
- Easy to audit and modify permissions
- Reduced code duplication

### Service Integration

Services import authorization functions:

```typescript
import {
  assertProjectAccess,
  assertProjectAdmin,
  assertTaskModifyAccess,
  assertCommentDeleteAccess,
} from "../lib/authorization";
```

Then use them before database operations:

```typescript
export async function updateTask(
  taskId: number,
  data: UpdateTaskInput,
  userId: number,
) {
  await assertTaskModifyAccess(taskId, userId);
  // ... rest of function
}
```

### Error Handling

Authorization failures throw appropriate errors:

- `NotFoundError("Project")` → 404 response
- `NotFoundError("Task")` → 404 response
- `ForbiddenError()` → 403 response
- `UnauthorizedError()` → 401 response (auth middleware)

## Testing

Authorization should be tested for:

1. ✅ Owner can access/modify/delete project
2. ✅ Admin can access/modify project (cannot delete)
3. ✅ Member can access/create tasks (cannot modify project)
4. ✅ Viewer can read-only access (cannot create)
5. ✅ Non-member cannot access project
6. ✅ Unauthenticated users cannot access
7. ✅ Viewer cannot perform member actions
8. ✅ Member cannot delete project
9. ✅ User cannot access another project's tasks
10. ✅ User cannot access another project's comments

## Future Enhancements

Possible security enhancements for future phases:

- Fine-grained permissions (custom roles)
- Time-based access restrictions
- Rate limiting per user/project
- Audit logging for sensitive operations
- IP-based access restrictions
- Two-factor authentication
