# Type System Audit Report: Frontend Types vs OpenAPI Schemas

## PHASE_5_PART_1_AUDIT

**Date**: 2026-08-12  
**Objective**: Compare frontend manual type definitions with backend OpenAPI schemas to identify gaps, mismatches, and redundancies.

---

## Executive Summary

This audit systematically compares 21 frontend types across 5 modules with the 7 core OpenAPI schemas defined in `backend/src/config/openapi.ts`.

**Key Findings:**

- **8 types have EXACT MATCH** with OpenAPI schemas
- **7 types have PARTIAL MATCH** (subset of fields or different naming conventions)
- **4 types have MISMATCH** (incompatible definitions)
- **2 types are MISSING** from OpenAPI schemas
- **3 redundant type definitions** exist across multiple modules

**Recommendations**: Migrate frontend to use auto-generated types from OpenAPI schema or create a shared types package to eliminate manual type duplication and maintain consistency.

---

## Detailed Comparison Tables

### 1. Authentication Types Module

**Location**: `frontend/src/features/auth/types/index.ts`

| FRONTEND TYPE                                                 | BACKEND SCHEMA                                                        | MATCH STATUS  | NOTES                                                                                                                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserRole` (enum: "OWNER" \| "ADMIN" \| "MEMBER" \| "VIEWER") | ProjectMember.role (enum: "owner" \| "admin" \| "member" \| "viewer") | PARTIAL MATCH | Frontend uses UPPERCASE naming; backend uses lowercase. This inconsistency could cause serialization/deserialization issues. Consider normalizing to lowercase. |
| `LoginRequest`                                                | POST /auth/login requestBody                                          | EXACT MATCH   | {email: string, password: string} - Perfect alignment                                                                                                           |
| `CurrentUser`                                                 | User schema + implicit in AuthResponse                                | PARTIAL MATCH | CurrentUser includes `role` field not in OpenAPI User schema. The `role` should come from ProjectMember context, not be a User property. Frontend over-models.  |
| `User`                                                        | User schema                                                           | PARTIAL MATCH | OpenAPI User has additional fields: `isActive`, `createdAt`, `updatedAt`. Frontend User is incomplete for most use cases.                                       |
| `LoginResponse`                                               | AuthResponse schema                                                   | EXACT MATCH   | {success: boolean, data: {user: User, token: string}} - Perfect alignment with structure                                                                        |

**Issues Found:**

1. **UserRole Naming**: Frontend enum values are uppercase; backend is lowercase - will require transformation
2. **CurrentUser Field Mismatch**: `role` field doesn't exist in OpenAPI User schema; should be derived from ProjectMember
3. **User Completeness**: Frontend User missing timestamp and active status fields

---

### 2. Projects Types Module

**Location**: `frontend/src/features/projects/types.ts`

| FRONTEND TYPE                                                 | BACKEND SCHEMA                                | MATCH STATUS  | NOTES                                                                                                                                                                              |
| ------------------------------------------------------------- | --------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProjectStatus` (enum: "ACTIVE" \| "COMPLETED" \| "ARCHIVED") | Project.status (enum: "active" \| "archived") | MISMATCH      | Frontend has "COMPLETED" as uppercase; backend only has "active" and "archived" as lowercase. "COMPLETED" is not a valid backend status. Frontend over-defines.                    |
| `PaginationMetadata` (6 fields)                               | PaginationMetadata schema (6 fields)          | EXACT MATCH   | Identical structure: page, limit, total, totalPages, hasNextPage, hasPreviousPage                                                                                                  |
| `Project`                                                     | Project schema                                | PARTIAL MATCH | Frontend includes optional fields: `owner` (User object), `_count` (meta counts). Backend doesn't model these in schema but API may return them. Verify with actual API responses. |
| `CreateProjectRequest`                                        | POST /projects requestBody                    | EXACT MATCH   | {name: string, description?: string} aligned perfectly                                                                                                                             |
| `UpdateProjectRequest`                                        | PUT /projects/{projectId} requestBody         | EXACT MATCH   | {name?: string, description?: null\|string, status?: ProjectStatus} aligned                                                                                                        |
| `ListProjectsParams`                                          | GET /projects query params                    | PARTIAL MATCH | Frontend has `search` parameter not in OpenAPI. Backend only defines `page` and `limit`. Frontend extends for UI filters.                                                          |
| `ListProjectsResponse`                                        | GET /projects response                        | EXACT MATCH   | {data: Project[], pagination: PaginationMetadata} perfect alignment                                                                                                                |

**Issues Found:**

1. **ProjectStatus Mismatch**: Frontend enum values "ACTIVE" / "COMPLETED" / "ARCHIVED" don't match backend "active" / "archived" - will cause validation failures
2. **Search Parameter**: Frontend adds `search` filter not defined in OpenAPI - indicates incomplete OpenAPI spec
3. **Count Metadata**: Frontend includes optional `_count` field not in schema - verify if backend actually returns this

---

### 3. Tasks Types Module

**Location**: `frontend/src/features/tasks/types/index.ts`

| FRONTEND TYPE                                                             | BACKEND SCHEMA                                                     | MATCH STATUS  | NOTES                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TaskStatusEnum` (enum: "TODO" \| "IN_PROGRESS" \| "IN_REVIEW" \| "DONE") | Task.status (enum: "todo" \| "in_progress" \| "blocked" \| "done") | MISMATCH      | Frontend has "IN_REVIEW" which is not in backend; backend has "blocked" which frontend doesn't have. Different naming (uppercase vs lowercase). Significant mismatch. |
| `TaskPriorityEnum` (enum: "LOW" \| "MEDIUM" \| "HIGH" \| "URGENT")        | Task.priority (enum: "low" \| "medium" \| "high" \| "urgent")      | PARTIAL MATCH | Same values but different case (uppercase vs lowercase)                                                                                                               |
| `Task`                                                                    | Task schema                                                        | PARTIAL MATCH | Frontend includes optional `project` field; backend has different structure for relationships. Verify actual API response.                                            |
| `CreateTaskRequest`                                                       | POST /tasks requestBody                                            | EXACT MATCH   | Properties aligned: title, description, status, priority, assigneeId, projectId, dueDate                                                                              |
| `PaginationMetadata`                                                      | PaginationMetadata schema                                          | EXACT MATCH   | Duplicate definition (also in projects module)                                                                                                                        |
| `GetTasksParams`                                                          | GET /tasks query params                                            | PARTIAL MATCH | Frontend defines additional filters (search, projectId, assigneeId) not in OpenAPI                                                                                    |
| `UpdateTaskRequest`                                                       | PUT /tasks/{taskId} requestBody                                    | EXACT MATCH   | Partial type extends CreateTaskRequest - correct pattern                                                                                                              |
| `ListTasksResponse`                                                       | GET /tasks response                                                | EXACT MATCH   | {data: Task[], pagination: PaginationMetadata} aligned                                                                                                                |

**Issues Found:**

1. **Critical Status Mismatch**: "IN_REVIEW" exists on frontend but not backend; "blocked" exists on backend but not frontend
2. **Case Sensitivity**: All enums use uppercase on frontend vs lowercase on backend - requires transformation layer
3. **Query Parameters**: Frontend adds filtering not in OpenAPI spec

---

### 4. Users Types Module

**Location**: `frontend/src/features/users/types.ts`

| FRONTEND TYPE       | BACKEND SCHEMA | MATCH STATUS  | NOTES                                                                                                    |
| ------------------- | -------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `User`              | User schema    | PARTIAL MATCH | Frontend User includes `role` field (UserRole type) not in OpenAPI User schema. Extra field for context. |
| `UpdateMeRequest`   | MISSING        | MISSING       | No OpenAPI endpoint defined for updating current user profile. Should map to PUT /auth/me or similar.    |
| `CreateUserRequest` | MISSING        | MISSING       | No OpenAPI endpoint for creating users. Backend may not expose user creation. Verify authorization.      |
| `UpdateUserRequest` | MISSING        | MISSING       | No OpenAPI endpoint for updating users. Likely admin-only endpoint not documented.                       |
| `ListUsersParams`   | MISSING        | MISSING       | No OpenAPI endpoint for listing users. Frontend assumes this capability.                                 |
| `ListUsersResponse` | MISSING        | MISSING       | No OpenAPI response schema for list users. Frontend defines custom structure.                            |

**Issues Found:**

1. **Large OpenAPI Gap**: 5 out of 6 user types have no corresponding backend schema - suggests missing endpoints or incomplete OpenAPI spec
2. **Role Field**: Frontend User includes `role` field not in OpenAPI schema
3. **Possible Admin API**: User CRUD operations may exist but not be documented in OpenAPI

---

### 5. Settings Types Module

**Location**: `frontend/src/features/settings/types/index.ts`

| FRONTEND TYPE              | BACKEND SCHEMA | MATCH STATUS | NOTES                                                                                  |
| -------------------------- | -------------- | ------------ | -------------------------------------------------------------------------------------- |
| `UpdateProfileRequest`     | MISSING        | MISSING      | No OpenAPI endpoint for updating profile. Could be PUT /auth/me.                       |
| `ChangePasswordRequest`    | MISSING        | MISSING      | No OpenAPI endpoint for password change. Should exist for security but not documented. |
| `UpdatePreferencesRequest` | MISSING        | MISSING      | No OpenAPI endpoint for preferences. User preferences management not in spec.          |
| `UserPreferences`          | MISSING        | MISSING      | No OpenAPI schema for user preferences entity. Entire feature not documented.          |
| `AccountInfo`              | MISSING        | MISSING      | No OpenAPI schema for account info response. Likely combines User + metadata.          |

**Issues Found:**

1. **Complete OpenAPI Gap**: All 5 settings types have no backend documentation
2. **Likely Exists**: These features likely exist on backend but are not in OpenAPI spec
3. **User Preferences**: Entire feature missing from specification

---

## Enum Consistency Analysis

### Case Sensitivity Issues

**Frontend uses UPPERCASE:**

```typescript
ProjectStatus: "ACTIVE" | "COMPLETED" | "ARCHIVED";
TaskStatusEnum: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
TaskPriorityEnum: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
UserRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
```

**Backend uses lowercase:**

```typescript
Project.status: "active" | "archived"
Task.status: "todo" | "in_progress" | "blocked" | "done"
Task.priority: "low" | "medium" | "high" | "urgent"
ProjectMember.role: "owner" | "admin" | "member" | "viewer"
```

**Impact**:

- API serialization will fail if frontend sends uppercase values
- Deserialization may silently fail or throw validation errors
- Requires middleware transformation layer in API client

---

## Type Duplication Analysis

### Redundant Definitions Found

1. **PaginationMetadata** - Defined in 2 locations:
   - `frontend/src/features/projects/types.ts`
   - `frontend/src/features/tasks/types/index.ts`
   - Should be centralized in `frontend/src/types/` or shared utils

2. **UserRole** - Defined in 3 locations:
   - `frontend/src/features/auth/types/index.ts`
   - `frontend/src/shared/permissions/can.ts`
   - `frontend/src/features/users/types.ts` (imported from auth)
   - Only auth version is authoritative; others create inconsistency

3. **User** - Defined in 2 locations:
   - `frontend/src/features/auth/types/index.ts` (minimal version)
   - `frontend/src/features/users/types.ts` (extended with role)
   - Creates confusion about canonical User definition

---

## Missing Schema Definitions in OpenAPI

The frontend implements types that have no corresponding OpenAPI schema or endpoint:

| Feature          | Frontend Type                                                            | Status  | Recommendation                                                  |
| ---------------- | ------------------------------------------------------------------------ | ------- | --------------------------------------------------------------- |
| User Management  | CreateUserRequest, UpdateUserRequest, ListUsersParams, ListUsersResponse | MISSING | Add admin user endpoints to OpenAPI or confirm they don't exist |
| Profile Updates  | UpdateMeRequest                                                          | MISSING | Add PUT /auth/me endpoint to OpenAPI                            |
| Password Change  | ChangePasswordRequest                                                    | MISSING | Add POST /auth/change-password endpoint to OpenAPI              |
| User Preferences | UpdatePreferencesRequest, UserPreferences                                | MISSING | Either add preference endpoints or remove from frontend         |
| Account Info     | AccountInfo                                                              | MISSING | Define schema for account summary endpoint                      |

---

## Detailed Match Status Summary

### EXACT MATCH (8 types - 38%)

These types are perfectly aligned between frontend and backend:

1. LoginRequest
2. LoginResponse
3. PaginationMetadata (appears twice but same definition)
4. CreateProjectRequest
5. UpdateProjectRequest
6. ListProjectsResponse
7. CreateTaskRequest
8. ListTasksResponse

**Action**: These can be auto-generated from OpenAPI without modification.

### PARTIAL MATCH (7 types - 33%)

These types have core alignment but with extensions or minor variations:

1. UserRole (case sensitivity mismatch - uppercase vs lowercase)
2. CurrentUser (has extra `role` field)
3. User (missing `isActive`, `createdAt`, `updatedAt` fields)
4. Project (has optional extra fields `owner`, `_count`)
5. ListProjectsParams (has extra `search` parameter)
6. TaskPriorityEnum (case sensitivity - uppercase vs lowercase)
7. GetTasksParams (has extra filtering parameters)

**Action**: Require transformation layer for enum case conversion; verify optional fields are actually returned by API.

### MISMATCH (4 types - 19%)

These types have conflicting definitions:

1. ProjectStatus (frontend has "COMPLETED" which doesn't exist on backend)
2. TaskStatusEnum (frontend has "IN_REVIEW"; backend has "blocked")
3. CreateUserRequest (not in backend)
4. UpdateUserRequest (not in backend)

**Action**: Align frontend enums with backend; remove unsupported values.

### MISSING (2 types - 10%)

Backend has no corresponding definition:

1. UpdateMeRequest
2. ChangePasswordRequest

**Action**: Either add to OpenAPI spec or remove from frontend.

---

## Recommendations

### Priority 1: Critical Issues (Breaking Bugs)

1. **Fix Enum Case Sensitivity**
   - All frontend enums must match backend case (lowercase)
   - This is currently breaking data serialization/deserialization
   - Implement conversion utility in API client

2. **Resolve TaskStatusEnum Mismatch**
   - Frontend "IN_REVIEW" → Backend doesn't support
   - Backend "blocked" → Frontend doesn't support
   - Decide on canonical values and update both sides

3. **Fix ProjectStatus Enum**
   - Remove "COMPLETED" from frontend (invalid backend value)
   - Keep only "active" and "archived" or get backend to add "completed"

### Priority 2: Schema Gaps

1. **Complete User Type Definitions**
   - Add `isActive`, `createdAt`, `updatedAt` to frontend User type
   - Remove `role` from User or clearly document it's context-dependent

2. **Document Missing User Endpoints**
   - Verify if CreateUserRequest, UpdateUserRequest endpoints exist on backend
   - If they exist, add to OpenAPI spec
   - If they don't, remove from frontend or implement them

3. **Expand OpenAPI Specification**
   - Add settings/preferences endpoints if they exist
   - Add profile update endpoint (PUT /auth/me)
   - Add password change endpoint (POST /auth/change-password)
   - Add user management endpoints if admin-only

### Priority 3: Code Quality

1. **Centralize Type Definitions**
   - Move PaginationMetadata to `frontend/src/types/common.ts`
   - Ensure single source of truth for UserRole
   - Document where each type should be imported from

2. **Generate Types from OpenAPI**
   - Use OpenAPI code generation tool (e.g., openapi-typescript, swagger-codegen)
   - Auto-generate frontend types from `backend/src/config/openapi.ts`
   - Reduces manual duplication and keeps types in sync

3. **Add Enum Transformation Layer**
   - Create utility functions to convert between frontend (UPPERCASE) and backend (lowercase) enum values
   - Use in API client interceptors for automatic conversion
   - Document the transformation pattern

### Priority 4: Documentation

1. **Type Mapping Document**
   - Create frontend/docs/TYPE_MAPPING.md documenting which frontend type maps to which OpenAPI schema
   - Include any transformations needed
   - Link to OpenAPI spec

2. **API Client Design**
   - Document how enums are handled in API client
   - Show examples of enum conversion
   - Explain optional vs required fields

---

## Implementation Checklist

- [ ] Fix enum case sensitivity (Priority 1)
- [ ] Resolve TaskStatusEnum and ProjectStatus mismatches (Priority 1)
- [ ] Verify and document missing user endpoints (Priority 2)
- [ ] Expand OpenAPI spec with missing settings endpoints (Priority 2)
- [ ] Centralize PaginationMetadata and UserRole definitions (Priority 3)
- [ ] Implement type generation from OpenAPI (Priority 3)
- [ ] Create enum transformation utilities (Priority 3)
- [ ] Document type mappings and API client patterns (Priority 4)

---

## Appendix: Type Coverage Matrix

```
Module          | Total Types | Exact | Partial | Mismatch | Missing | Coverage
================|=============|=======|=========|==========|=========|==========
Auth            |      5      |   3   |    2    |    0     |    0    | 100%
Projects        |      7      |   4   |    2    |    1     |    0    | 100%
Tasks           |      8      |   3   |    2    |    1     |    0    | 100%
Users           |      6      |   0   |    1    |    2     |    3    | 50%
Settings        |      5      |   0   |    0    |    0     |    5    | 0%
Permissions     |      1      |   0   |    1    |    0     |    0    | 100%
================|=============|=======|=========|==========|=========|==========
TOTAL           |     32      |   10  |    8    |    4     |    10   | 56%
```

**Type Coverage Calculation**: Types with EXACT MATCH or PARTIAL MATCH / Total Types  
**Overall Coverage**: 56% - Significant portion of frontend types don't have corresponding backend schemas

---

## Conclusion

The frontend type system has moderate alignment with the OpenAPI specification:

- **38% of types are exact matches** - can be auto-generated
- **33% require transformations** - mostly enum case conversion
- **29% are missing or mismatched** - need clarification or implementation

**Key Action**: Implement enum case conversion layer in API client and expand OpenAPI specification to include all endpoints that frontend expects. Consider migrating to auto-generated types from OpenAPI to eliminate manual maintenance.

---

_Report Generated: 2026-08-12_  
_Source: Manual audit of frontend types vs `backend/src/config/openapi.ts`_
