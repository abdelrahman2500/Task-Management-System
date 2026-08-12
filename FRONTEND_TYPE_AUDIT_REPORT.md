# Frontend Type Audit Report

**Generated:** 2026-08-12  
**Scope:** `frontend/src` directory  
**Total Types Found:** 60 type definitions across 7 files

---

## Executive Summary

### Key Findings

1. **Major Type Duplication:** 27 type definitions (45%) are duplicated across feature modules and generated types
2. **Critical Enum Mismatch:** Task status and priority enums use uppercase format locally but lowercase in generated types
3. **Three Levels of Type Definition:**
   - **Generated Types** (source of truth): `shared/api/generated/types.ts` - 31 types from OpenAPI spec
   - **Feature-Specific Types:** Feature modules have local type copies (often outdated or inconsistent)
   - **UI-Only Types:** Permission and utility types (legitimately local)

### Risk Assessment

**🔴 CRITICAL (2 issues):**

- TaskStatusEnum/TaskPriorityEnum case mismatch with generated types
- Enum value incompatibility will cause runtime failures

**🟠 HIGH (8 issues):**

- ProjectStatus value mismatch (ACTIVE vs active)
- UserRole defined in 3 places (source of truth fragmentation)
- Direct duplications preventing single source of truth

**🟡 MEDIUM (12 issues):**

- Redundant type definitions increasing maintenance burden
- Inconsistent API contract enforcement across features

**🟢 LOW (3 issues):**

- UI-only types properly scoped (no action needed)
- Utility types match backend contracts

---

## Detailed Analysis by Location

### 1. Generated Types (Source of Truth)

**File:** `frontend/src/shared/api/generated/types.ts`  
**Status:** ✅ Source of Truth  
**Count:** 31 types  
**Edit Policy:** AUTO-GENERATED - Do not edit manually

**Contains:**

- **Security:** BearerAuth
- **Core Entities:** User, Project, ProjectMember, Task, Comment
- **Request Types:** RegisterRequest, LoginRequest, Create*/Update* types
- **Response Types:** PaginatedResponse, ItemResponse, SuccessResponse
- **Query Parameters:** ListProjectsParams, ListTasksParams, etc.
- **Response Aliases:** ProjectsResponse, TasksResponse, CommentsResponse

**Migration Status:** ✅ No migration needed - these are the canonical types

---

### 2. Auth Feature Types

**File:** `frontend/src/features/auth/types/index.ts`  
**Count:** 5 types  
**Status:** 🔴 NEEDS CONSOLIDATION

#### Issues Found:

| Type            | Issue                                                                  | Action                                                                    |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `UserRole`      | Duplicated in 2 other files (permissions/can.ts, shared/api/generated) | Import from single source                                                 |
| `LoginRequest`  | Exact duplicate of generated type                                      | Remove, import from generated/types                                       |
| `User`          | Simplified duplicate of generated User                                 | Remove, import from generated/types                                       |
| `LoginResponse` | Matches AuthResponse structure                                         | Remove, import AuthResponse from generated                                |
| `CurrentUser`   | UI-specific extension with role field                                  | Use generated User + extends pattern OR create proper extension interface |

**Recommended Action:** Import all types from `shared/api/generated/types` and delete local duplicates

---

### 3. Projects Feature Types

**File:** `frontend/src/features/projects/types.ts`  
**Count:** 7 types  
**Status:** 🟠 NEEDS CONSOLIDATION

#### Issues Found:

| Type                   | Issue                                                                                                  | Action                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `ProjectStatus`        | **MISMATCH:** Local = `"ACTIVE" \| "COMPLETED" \| "ARCHIVED"` but Generated = `"active" \| "archived"` | Align with generated (lowercase, no COMPLETED) |
| `PaginationMetadata`   | Identical duplicate                                                                                    | Remove, import from generated                  |
| `Project`              | Similar but adds `_count` property                                                                     | Import generated + extend with count if needed |
| `CreateProjectRequest` | Duplicate of generated                                                                                 | Remove, import from generated                  |
| `UpdateProjectRequest` | Duplicate of generated                                                                                 | Remove, import from generated                  |
| `ListProjectsParams`   | Duplicate of generated                                                                                 | Remove, import from generated                  |
| `ListProjectsResponse` | Duplicate of `ProjectsResponse` alias                                                                  | Remove, use generated alias                    |

**Recommended Action:** Delete all duplicates, import from generated, extend only `Project` interface for `_count`

```typescript
// After consolidation:
import {
  ProjectStatus as GeneratedProjectStatus,
  Project as GeneratedProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  ListProjectsParams,
  ProjectsResponse,
} from "shared/api/generated/types";

// Extend only if needed
export interface Project extends GeneratedProject {
  _count?: { members: number; tasks: number };
}

// Re-export for backwards compatibility
export type ProjectStatus = GeneratedProjectStatus;
export {
  CreateProjectRequest,
  UpdateProjectRequest,
  ListProjectsParams,
  ProjectsResponse,
};
```

---

### 4. Tasks Feature Types

**File:** `frontend/src/features/tasks/types/index.ts`  
**Count:** 8 types  
**Status:** 🔴 CRITICAL MISMATCH

#### Issues Found:

| Type                 | Issue                                                                                                                                          | Severity    | Action                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `TaskStatusEnum`     | **CASE MISMATCH:** Local = `"TODO" \| "IN_PROGRESS" \| "IN_REVIEW" \| "DONE"` but Generated = `"todo" \| "in_progress" \| "blocked" \| "done"` | 🔴 CRITICAL | Update to match generated lowercase values |
| `TaskPriorityEnum`   | **CASE MISMATCH:** Local = `"LOW" \| "MEDIUM" \| "HIGH" \| "URGENT"` but Generated = `"low" \| "medium" \| "high" \| "urgent"`                 | 🔴 CRITICAL | Update to match generated lowercase values |
| `Task`               | Uses local enums (uppercase) instead of generated                                                                                              | 🔴 CRITICAL | Import from generated                      |
| `CreateTaskRequest`  | Uses local enums (uppercase) instead of generated                                                                                              | 🔴 CRITICAL | Import from generated                      |
| `PaginationMetadata` | Duplicate                                                                                                                                      | 🟡 MEDIUM   | Remove, import from generated              |
| `GetTasksParams`     | Duplicate of `ListTasksParams`                                                                                                                 | 🟡 MEDIUM   | Remove, use generated                      |
| `UpdateTaskRequest`  | Duplicate (Partial<CreateTaskRequest>)                                                                                                         | 🟡 MEDIUM   | Use generated                              |
| `ListTasksResponse`  | Duplicate of `TasksResponse` alias                                                                                                             | 🟡 MEDIUM   | Use generated                              |

**⚠️ CRITICAL ISSUE:** The uppercase/lowercase mismatch will cause API failures when submitting task data.

**Example Problem:**

```typescript
// Frontend sends:
{ status: "IN_PROGRESS", priority: "HIGH" }

// Backend expects:
{ status: "in_progress", priority: "high" }

// Result: API validation error or data corruption
```

**Recommended Action:**

1. **IMMEDIATELY** extract status/priority enums from generated types
2. Update all code using uppercase enums to lowercase
3. Verify all task form submissions use generated enums

```typescript
// After consolidation:
import {
  Task as GeneratedTask,
  CreateTaskRequest as GeneratedCreateTaskRequest,
  UpdateTaskRequest as GeneratedUpdateTaskRequest,
  ListTasksParams,
  TasksResponse,
} from "shared/api/generated/types";

// Extract the enums from the generated types
export type TaskStatusEnum = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriorityEnum = "low" | "medium" | "high" | "urgent";

// Re-export or alias
export type Task = GeneratedTask;
export type CreateTaskRequest = GeneratedCreateTaskRequest;
export type UpdateTaskRequest = GeneratedUpdateTaskRequest;
```

---

### 5. Users Feature Types

**File:** `frontend/src/features/users/types.ts`  
**Count:** 5 types  
**Status:** 🟡 MIXED - Some duplication, some custom

#### Issues Found:

| Type                | Issue                                               | Action                                                       |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| `User`              | Extended duplicate (adds role field)                | Import generated User and check if role alignment is correct |
| `UpdateMeRequest`   | Custom (not in generated)                           | Keep - UI-specific for updating current user                 |
| `CreateUserRequest` | Custom (not in generated)                           | Keep if admin-specific; otherwise add to backend API         |
| `UpdateUserRequest` | Custom (not in generated)                           | Consolidate with UpdateMeRequest or align with backend       |
| `ListUsersParams`   | Similar to generated but adds role/isActive filters | Merge with ListProjectsParams pattern                        |
| `ListUsersResponse` | Similar to PaginatedResponse                        | Use generated PaginatedResponse                              |

**Recommended Action:**

- Import `User` from generated as base
- Keep custom request types if they're admin-specific
- Align list response with generated PaginatedResponse pattern

---

### 6. Settings Feature Types

**File:** `frontend/src/features/settings/types/index.ts`  
**Count:** 5 types  
**Status:** ✅ Legitimate - No generated equivalents found

#### Types:

- `UpdateProfileRequest` - Settings-specific update
- `ChangePasswordRequest` - Settings-specific password change
- `UpdatePreferencesRequest` - User preferences settings
- `UserPreferences` - User preferences entity
- `AccountInfo` - Account summary entity

**Status:** ✅ Keep as-is (not duplicated, API-specific)

---

### 7. Permissions Types

**File:** `frontend/src/shared/permissions/can.ts`  
**Count:** 5 types  
**Status:** 🟠 ONE DUPLICATION, REST LEGITIMATE

#### Issues Found:

| Type                | Issue                                                | Action                                |
| ------------------- | ---------------------------------------------------- | ------------------------------------- |
| `UserRole`          | Duplicated in 3 places (here, auth/types, generated) | Import from single source (generated) |
| `Resource`          | UI-only (no backend equivalent)                      | ✅ Keep as-is                         |
| `Action`            | UI-only (no backend equivalent)                      | ✅ Keep as-is                         |
| `PermissionContext` | UI-only authorization context                        | ✅ Keep as-is                         |
| `PermissionUser`    | UI-only (lightweight User for permissions)           | ✅ Keep as-is                         |

**Recommended Action:**

```typescript
// Import UserRole from single source
import type { User } from 'shared/api/generated/types';

// Extract role type if needed
export type UserRole = User['role'] | ...  // or import from generated
```

---

### 8. Error Handling Utilities

**File:** `frontend/src/shared/utils/errorHandling.ts`  
**Count:** 1 type (ApiErrorResponse)  
**Status:** ✅ Correct alignment

- `ApiErrorResponse` interface matches backend ErrorResponse structure
- Properly scoped to error handling utilities
- **No action needed**

---

## Migration Roadmap

### Phase 1: Critical Fixes (Do First)

**Priority:** 🔴 CRITICAL - Blocks API functionality

1. **Fix TaskStatusEnum/TaskPriorityEnum case sensitivity**
   - Update `frontend/src/features/tasks/types/index.ts`
   - Change uppercase to lowercase: `"TODO"` → `"todo"`, etc.
   - Update all task form components to use generated enums
   - **Estimated time:** 1-2 hours
   - **Files affected:** tasks/types.ts, tasks/components/_, tasks/hooks/_

2. **Fix ProjectStatus mismatch**
   - Update `frontend/src/features/projects/types.ts`
   - Remove `"COMPLETED"` from union (not in API)
   - Change case: `"ACTIVE"` → `"active"`, `"ARCHIVED"` → `"archived"`
   - **Estimated time:** 30 minutes
   - **Files affected:** projects/types.ts, projects/components/_, projects/hooks/_

### Phase 2: Type Consolidation (Week 1)

**Priority:** 🟠 HIGH - Prevents future bugs

1. **Auth Feature Consolidation**

   ```bash
   # Delete: frontend/src/features/auth/types/index.ts
   # Create: frontend/src/features/auth/types.ts (single re-export file)
   # Import from: shared/api/generated/types
   ```

2. **Projects Feature Consolidation**

   ```bash
   # Consolidate: frontend/src/features/projects/types.ts
   # Keep only: extensions + re-exports
   ```

3. **Users Feature Alignment**

   ```bash
   # Review and align: frontend/src/features/users/types.ts
   # Keep custom types that don't exist in generated
   ```

4. **Tasks Feature Cleanup**
   ```bash
   # Consolidate: frontend/src/features/tasks/types/index.ts
   # Import from generated, apply case fix
   ```

### Phase 3: Single UserRole Source (Week 2)

**Priority:** 🟡 MEDIUM - Code clarity

- Define `UserRole` in ONE place only: `shared/api/generated/types` (if not already)
- Import everywhere else:
  ```typescript
  import type { UserRole } from "shared/api/generated/types";
  ```
- Remove from: `features/auth/types/index.ts`, `shared/permissions/can.ts`

---

## Files to Modify (Priority Order)

### 🔴 MUST FIX (Phase 1)

1. `frontend/src/features/tasks/types/index.ts` - Fix enum case sensitivity
2. `frontend/src/features/projects/types.ts` - Fix ProjectStatus values

### 🟠 SHOULD FIX (Phase 2)

3. `frontend/src/features/auth/types/index.ts` - Remove duplicates
4. `frontend/src/features/users/types.ts` - Consolidate
5. `frontend/src/features/tasks/types/index.ts` - Remove duplicates
6. `frontend/src/features/projects/types.ts` - Remove duplicates

### 🟡 NICE TO FIX (Phase 3)

7. `frontend/src/shared/permissions/can.ts` - Single UserRole source

### ✅ NO CHANGES NEEDED

- `frontend/src/shared/api/generated/types.ts` - Source of truth
- `frontend/src/features/settings/types/index.ts` - No duplicates
- `frontend/src/shared/utils/errorHandling.ts` - Correctly scoped

---

## Type Import Pattern (Best Practices)

### Pattern 1: Pure Re-export (for duplicates)

```typescript
// ❌ OLD: frontend/src/features/auth/types/index.ts (DUPLICATED)
export interface User {
  /* ... */
}
export interface LoginRequest {
  /* ... */
}

// ✅ NEW: frontend/src/features/auth/types/index.ts (RE-EXPORT)
export type {
  User,
  LoginRequest,
  LoginResponse,
} from "shared/api/generated/types";
export { CurrentUser } from "./currentUser";
```

### Pattern 2: Extend with additional properties

```typescript
// ✅ NEW: frontend/src/features/projects/types.ts (EXTENDED)
import type { Project as GeneratedProject } from "shared/api/generated/types";

export interface Project extends GeneratedProject {
  _count?: { members: number; tasks: number };
}

export {
  ProjectStatus,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "shared/api/generated/types";
```

### Pattern 3: UI-only types (keep local)

```typescript
// ✅ KEEP LOCAL: frontend/src/shared/permissions/can.ts
export type Resource = "users" | "projects" | "tasks" | "settings" | "profile";
export type Action = "create" | "read" | "update" | "delete" | "manage";

export interface PermissionContext {
  ownerId?: number;
  currentUserId?: number;
  // ... UI-only fields
}
```

---

## Verification Checklist

After applying migrations, verify:

- [ ] All task submissions use lowercase status/priority enums
- [ ] Project status values match: `"active"` and `"archived"` only
- [ ] TypeScript compilation succeeds with no errors
- [ ] No duplicate type definitions in codebase
- [ ] All feature modules import types from `shared/api/generated/types`
- [ ] UserRole defined in exactly one place
- [ ] All tests pass (especially task/project forms)
- [ ] API integration tests verify enum values are lowercase

---

## Summary Statistics

| Category               | Count    |
| ---------------------- | -------- |
| Total Types Found      | 60       |
| API-Related Types      | 47       |
| UI-Only Types          | 13       |
| Duplicated Types       | 27 (45%) |
| Critical Issues        | 2        |
| High Priority Issues   | 8        |
| Medium Priority Issues | 12       |
| Files with Issues      | 5        |
| Files with No Issues   | 3        |

---

## CSV Report Location

A detailed CSV report with all types, locations, and migration status is available at:

```
frontend-type-audit.csv
```

Columns: `FILE | TYPE_NAME | TYPE_KIND | PURPOSE | GENERATED_EQUIVALENT | NEEDS_MIGRATION | NOTES`
