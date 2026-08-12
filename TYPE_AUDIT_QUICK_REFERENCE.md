# Frontend Type Audit - Quick Reference

## 🔴 CRITICAL ISSUES (Fix Immediately)

### Issue #1: TaskStatusEnum Case Mismatch

**Severity:** 🔴 CRITICAL - API will reject requests  
**File:** `frontend/src/features/tasks/types/index.ts`

```typescript
// ❌ CURRENT (WRONG)
export type TaskStatusEnum = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

// ✅ MUST BE
export type TaskStatusEnum = "todo" | "in_progress" | "blocked" | "done";
```

**Note:** Also changed from `"IN_REVIEW"` to `"blocked"` - new status value!

---

### Issue #2: TaskPriorityEnum Case Mismatch

**Severity:** 🔴 CRITICAL - API will reject requests  
**File:** `frontend/src/features/tasks/types/index.ts`

```typescript
// ❌ CURRENT (WRONG)
export type TaskPriorityEnum = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ✅ MUST BE
export type TaskPriorityEnum = "low" | "medium" | "high" | "urgent";
```

---

### Issue #3: ProjectStatus Case & Value Mismatch

**Severity:** 🔴 CRITICAL - API will reject requests  
**File:** `frontend/src/features/projects/types.ts`

```typescript
// ❌ CURRENT (WRONG)
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

// ✅ MUST BE
export type ProjectStatus = "active" | "archived";
// Note: "COMPLETED" is not a valid status in the API
```

---

## 🟠 HIGH PRIORITY (Do This Week)

### Consolidation Plan

#### Step 1: Auth Feature

**File:** `frontend/src/features/auth/types/index.ts`

```typescript
// Delete everything and replace with:
export type {
  User,
  LoginRequest,
  AuthResponse as LoginResponse,
  RegisterRequest,
} from "../../shared/api/generated/types";

// Keep only UI-specific types if needed:
export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

#### Step 2: Projects Feature

**File:** `frontend/src/features/projects/types.ts`

```typescript
// Keep only:
export {
  Project,
  ProjectStatus,
  CreateProjectRequest,
  UpdateProjectRequest,
  ListProjectsParams,
  ProjectsResponse,
  PaginationMetadata,
} from "../../shared/api/generated/types";

// Extend if needed:
export interface ProjectWithMeta extends Project {
  _count?: { members: number; tasks: number };
}
```

#### Step 3: Tasks Feature

**File:** `frontend/src/features/tasks/types/index.ts`

```typescript
// After fixing enum case sensitivity:
export {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ListTasksParams as GetTasksParams, // Alias for backwards compat
  TasksResponse as ListTasksResponse, // Alias for backwards compat
  PaginationMetadata,
} from "../../shared/api/generated/types";

// Extract enums for convenience
export type TaskStatusEnum = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriorityEnum = "low" | "medium" | "high" | "urgent";
```

#### Step 4: Users Feature

**File:** `frontend/src/features/users/types.ts`

```typescript
export type { User } from "../../shared/api/generated/types";

// Keep custom types:
export interface UpdateMeRequest {
  name?: string;
  email?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

// Use generated for list params
export {
  ListProjectsParams as ListUsersParams,
  PaginatedResponse as ListUsersResponse,
} from "../../shared/api/generated/types";
```

#### Step 5: Permissions Feature

**File:** `frontend/src/shared/permissions/can.ts`

```typescript
// Add import at top:
import type { User } from "../api/generated/types";

// Extract UserRole from generated types
export type UserRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

// Or import if added to generated:
// import type { UserRole } from '../api/generated/types';

// REMOVE this duplicate definition
```

---

## 📊 Type Summary Table

| Type                 | Location                                                | Duplication | Status               | Action                                  |
| -------------------- | ------------------------------------------------------- | ----------- | -------------------- | --------------------------------------- |
| User                 | generated/types.ts + auth/types.ts + users/types.ts     | 3x          | 🟠 Remove duplicates | Import from generated                   |
| UserRole             | generated/types.ts + auth/types.ts + permissions/can.ts | 3x          | 🟠 Remove duplicates | Import from generated                   |
| LoginRequest         | generated/types.ts + auth/types.ts                      | 2x          | 🟠 Remove duplicate  | Import from generated                   |
| Task                 | generated/types.ts + tasks/types.ts                     | 2x          | 🔴 + ENUM ISSUE      | Fix enums, import from generated        |
| TaskStatusEnum       | tasks/types.ts                                          | 1x LOCAL    | 🔴 CRITICAL          | Fix case sensitivity                    |
| TaskPriorityEnum     | tasks/types.ts                                          | 1x LOCAL    | 🔴 CRITICAL          | Fix case sensitivity                    |
| Project              | generated/types.ts + projects/types.ts                  | 2x          | 🟠 Remove duplicate  | Import from generated, extend if needed |
| ProjectStatus        | projects/types.ts                                       | 1x LOCAL    | 🔴 CRITICAL          | Fix case + remove COMPLETED             |
| PaginationMetadata   | generated/types.ts + projects/types.ts + tasks/types.ts | 3x          | 🟠 Remove duplicates | Import from generated                   |
| Comment              | generated/types.ts                                      | 1x          | ✅ OK                | No action                               |
| CreateTaskRequest    | generated/types.ts + tasks/types.ts                     | 2x          | 🔴 + ENUM ISSUE      | Fix enums, import                       |
| CreateProjectRequest | generated/types.ts + projects/types.ts                  | 2x          | 🟠 Remove duplicate  | Import from generated                   |

---

## 🎯 Action Items Checklist

### Immediate (Today)

- [ ] Review and document all enum case issues in tasks
- [ ] Check API spec for confirmed lowercase/uppercase format
- [ ] Create branch for fixes

### Week 1: Critical Fixes

- [ ] Fix TaskStatusEnum → `"todo" | "in_progress" | "blocked" | "done"`
- [ ] Fix TaskPriorityEnum → `"low" | "medium" | "high" | "urgent"`
- [ ] Fix ProjectStatus → `"active" | "archived"` (remove COMPLETED)
- [ ] Update all task forms to use lowercase enums
- [ ] Update all project status filters to use lowercase
- [ ] Run tests - especially form submissions
- [ ] Test API integration with new enum values

### Week 2: Consolidation

- [ ] Consolidate auth/types.ts → import from generated
- [ ] Consolidate projects/types.ts → import from generated
- [ ] Consolidate tasks/types.ts → import from generated
- [ ] Consolidate users/types.ts → clean up imports
- [ ] Fix permissions/can.ts → single UserRole source
- [ ] Run full test suite
- [ ] Verify no TypeScript errors

### Week 3: Verification

- [ ] Code review of all type consolidations
- [ ] Full frontend test pass
- [ ] API integration test pass
- [ ] E2E tests for critical flows (task creation, project updates)
- [ ] Performance check (ensure no bundling issues)

---

## Import Examples (Copy-Paste Ready)

### Auth Types (NEW)

```typescript
// frontend/src/features/auth/types/index.ts
export type {
  User,
  LoginRequest,
  AuthResponse as LoginResponse,
  RegisterRequest,
} from "../../shared/api/generated/types";
```

### Projects Types (NEW)

```typescript
// frontend/src/features/projects/types.ts
export {
  type Project,
  type ProjectStatus,
  type CreateProjectRequest,
  type UpdateProjectRequest,
  type ListProjectsParams,
  type ProjectsResponse,
  type PaginationMetadata,
} from "../../shared/api/generated/types";
```

### Tasks Types (NEW - with case fix)

```typescript
// frontend/src/features/tasks/types/index.ts
// FIX: Update enums to lowercase
export type TaskStatusEnum = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriorityEnum = "low" | "medium" | "high" | "urgent";

// Import from generated
export {
  type Task,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type ListTasksParams,
  type TasksResponse,
  type PaginationMetadata,
} from "../../shared/api/generated/types";
```

### Users Types (NEW)

```typescript
// frontend/src/features/users/types.ts
export type { User } from "../../shared/api/generated/types";

export interface UpdateMeRequest {
  name?: string;
  email?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface ListUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Testing Reminders

### Unit Tests to Update

- [ ] Task form submission tests → use lowercase enums
- [ ] Project status filter tests → use lowercase values
- [ ] User role permission tests → import single source

### Integration Tests

- [ ] Create task with lowercase status/priority
- [ ] Create project with lowercase status
- [ ] List tasks with status filter
- [ ] List projects with status filter

### E2E Tests

- [ ] Create task workflow (verify API payload)
- [ ] Update task status (verify API payload)
- [ ] Create project workflow
- [ ] Update project status

---

## Quick Stats

```
Total Types: 60
Duplicated: 27 (45%)
Critical Issues: 2 (enums + status)
High Priority: 8
Files Affected: 5
Source of Truth: shared/api/generated/types.ts (31 types)
```

---

## Generated From

- **Audit Date:** 2026-08-12
- **Scope:** frontend/src directory
- **Full Report:** FRONTEND_TYPE_AUDIT_REPORT.md
- **CSV Export:** frontend-type-audit.csv
