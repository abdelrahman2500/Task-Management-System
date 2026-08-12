# Frontend Type Architecture & Migration Diagram

## Current State (Problematic)

```
┌─────────────────────────────────────────────────────────────────────┐
│          shared/api/generated/types.ts (AUTO-GENERATED)            │
│  [Source of Truth - 31 types from OpenAPI spec]                    │
│                                                                     │
│  ✓ User, Project, Task, Comment                                    │
│  ✓ Create*/Update* Request types                                  │
│  ✓ Pagination, Response envelopes                                 │
│  ✓ task.status: "todo"|"in_progress"|"blocked"|"done"             │
│  ✓ project.status: "active"|"archived"                            │
│  ✓ priority: "low"|"medium"|"high"|"urgent"                       │
└────────────────┬──────────────────────────────────────────────────┘
                 │
      ┌──────────┼──────────┬────────────┬──────────────┐
      │          │          │            │              │
      ▼          ▼          ▼            ▼              ▼
   ❌          ❌          ❌          ❌             ❌
┌──────────────┐ ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
│ auth/types   │ │ projects/types  │ │ tasks/types  │ │ users/types  │ │ permissions/   │
│              │ │                 │ │              │ │              │ │ can.ts         │
│ DUPLICATES:  │ │ DUPLICATES:     │ │ DUPLICATES:  │ │ DUPLICATES:  │ │                │
│              │ │                 │ │              │ │              │ │ UserRole dup   │
│ • User       │ │ • ProjectStatus │ │ • Task       │ │ • User       │ │ (3 definitions)│
│ • UserRole   │ │   (CRITICAL)    │ │ • Priority*  │ │ • Params     │ │                │
│ • LoginReq   │ │ • Project       │ │   (CRITICAL) │ │              │ │ ISSUES:        │
│ • LoginResp  │ │ • Pagination    │ │ • Status*    │ │ • Response   │ │ • UserRole dup │
│              │ │ • CreateProj    │ │   (CRITICAL) │ │              │ │                │
│ VALUES OK    │ │ • UpdateProj    │ │ • Pagination│ │ VALUES OK    │ │ VALUES OK      │
│ (lowercase)  │ │ • ListParams    │ │              │ │              │ │                │
│              │ │ • Response      │ │ ENUM MISMATCH│ │              │ │                │
│              │ │                 │ │              │ │              │ │                │
│              │ │ VALUE MISMATCH: │ │ UPPERCASE    │ │              │ │                │
│              │ │ Local:          │ │ IN_PROGRESS  │ │              │ │                │
│              │ │ ACTIVE,         │ │              │ │              │ │                │
│              │ │ COMPLETED,      │ │ API Expects: │ │              │ │                │
│              │ │ ARCHIVED        │ │ in_progress  │ │              │ │                │
│              │ │                 │ │              │ │              │ │                │
│              │ │ API:            │ │ ❌ BREAKS    │ │              │ │                │
│              │ │ active,         │ │ API CALLS    │ │              │ │                │
│              │ │ archived        │ │              │ │              │ │                │
│              │ │                 │ │ New Status:  │ │              │ │                │
│              │ │ NO COMPLETED    │ │ "blocked"    │ │              │ │                │
│              │ │                 │ │ vs           │ │              │ │                │
│              │ │ ❌ API BREAKS   │ │ "in_review"  │ │              │ │                │
└──────────────┘ └─────────────────┘ └──────────────┘ └──────────────┘ └────────────────┘
```

---

## Target State (Fixed)

```
┌─────────────────────────────────────────────────────────────────────┐
│     shared/api/generated/types.ts (AUTO-GENERATED)                 │
│     [SINGLE SOURCE OF TRUTH - 31 types]                            │
│                                                                     │
│  ✅ User, Project, Task, Comment (all lowercase values)            │
│  ✅ Create*/Update* Request types                                 │
│  ✅ Pagination, Response envelopes                                │
│  ✅ task.status: "todo"|"in_progress"|"blocked"|"done"            │
│  ✅ project.status: "active"|"archived"                           │
│  ✅ priority: "low"|"medium"|"high"|"urgent"                      │
│  ✅ UserRole: "OWNER"|"ADMIN"|"MEMBER"|"VIEWER"                  │
└────────────────┬──────────────────────────────────────────────────┘
                 │
     ┌───────────┼───────────┬────────────┬──────────────┐
     │           │           │            │              │
     ▼           ▼           ▼            ▼              ▼
   ✅          ✅          ✅          ✅             ✅
┌──────────────┐ ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
│ auth/types   │ │ projects/types  │ │ tasks/types  │ │ users/types  │ │ permissions/   │
│ (RE-EXPORT)  │ │ (RE-EXPORT)     │ │ (RE-EXPORT)  │ │ (RE-EXPORT)  │ │ can.ts         │
│              │ │ + EXTEND if     │ │ + EXTEND if  │ │ + CUSTOM if  │ │ (IMPORT ONLY)  │
│ IMPORTS:     │ │   needed        │ │   needed     │ │   needed     │ │                │
│              │ │                 │ │              │ │              │ │ IMPORTS:       │
│ • User       │ │ IMPORTS:        │ │ IMPORTS:     │ │ IMPORTS:     │ │                │
│ • UserRole   │ │ • Project       │ │ • Task       │ │ • User       │ │ • UserRole     │
│ • LoginReq   │ │ • ProjectStatus │ │ • Status Enum│ │ • Params     │ │   (single!)    │
│ • LoginResp  │ │ • Create/Update │ │ • Priority   │ │ • Custom types
  │ • Custom    │
│ • Register   │ │ • Pagination    │ │ • Pagination│ │ (settings) │ │                │
│              │ │ • Response      │ │ • Response  │ │              │ │ DEFINES:       │
│ • CurrentUser│ │ • ListParams    │ │ • ListParams│ │ • Create/   │ │ • Resource     │
│   (if needed)│ │                 │ │              │ │ UpdateUser  │ │ • Action       │
│              │ │ EXTENDS:        │ │ EXTENDS:    │ │ • UpdateMe  │ │ • Permission   │
│              │ │ Project (if     │ │ Status/Prio │ │ • ListUsers │ │   Context      │
│              │ │ _count needed)  │ │ (if custom  │ │ • Response  │ │ • PermUser     │
│              │ │                 │ │  format)    │ │              │ │                │
│              │ │                 │ │              │ │              │ │                │
│ ✅ NO        │ │ ✅ NO DUPLICATES│ │ ✅ NO DUPS  │ │ ✅ OK MIX   │ │ ✅ NO DUPS     │
│ DUPLICATES   │ │ ALL IMPORTS     │ │ ENUMS FIXED │ │ IMPORT + OWN │ │ IMPORTS ONLY   │
└──────────────┘ └─────────────────┘ └──────────────┘ └──────────────┘ └────────────────┘
      │                 │                   │               │               │
      └─────────────────┴───────────────────┴───────────────┴───────────────┘
                              │
                    All imports consistently
                    from single source of truth
```

---

## Type Dependencies Flow

### Before (Complex, Error-Prone)

```
Task Component
      │
      ├─→ tasks/types.ts [TaskStatusEnum: "TODO"|"IN_PROGRESS"...]  ❌ UPPERCASE
      │         │
      │         ├─→ tasks/hooks/useTask.ts
      │         │
      │         └─→ tasks/api/task.api.ts ──→ axios [CONVERTS TO API FORMAT]
      │                                            │
      │                                            └─→ shared/api/generated/types.ts
      │                                                [status: "todo"|"in_progress"...]
      │                                                ✅ LOWERCASE
      │
      └─→ shared/permissions/can.ts [UserRole: "OWNER"|"ADMIN"...]
              │
              └─→ auth/types.ts [UserRole: "OWNER"|"ADMIN"...]  ❌ DUPLICATE
                      │
                      └─→ shared/api/generated/types.ts [UserRole implied]

PROBLEM: Type system ≠ API contract = RUNTIME FAILURES
```

### After (Clean, Single Source)

```
Task Component
      │
      ├─→ tasks/types.ts [imports from generated]
      │         │
      │         ├─→ tasks/hooks/useTask.ts
      │         │
      │         └─→ tasks/api/task.api.ts ──→ axios [DIRECT MAPPING]
      │                                            │
      │                                            └─→ shared/api/generated/types.ts
      │                                                [MATCHES PERFECTLY]
      │                                                ✅ LOWERCASE
      │
      └─→ shared/permissions/can.ts [imports from generated]
              │
              └─→ auth/types.ts [imports from generated]
                      │
                      └─→ shared/api/generated/types.ts [SINGLE SOURCE]

SOLUTION: Single source of truth = GUARANTEED API COMPATIBILITY
```

---

## Enum Value Comparison Table

### Critical Mismatches

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK STATUS MISMATCH                         │
├──────────────────┬──────────────────┬────────────────────────────┤
│ Frontend LOCAL   │ API GENERATED    │ Result                     │
│ (CURRENT)        │ (CORRECT)        │                            │
├──────────────────┼──────────────────┼────────────────────────────┤
│ "TODO"           │ "todo"           │ ❌ UPPERCASE MISMATCH      │
│ "IN_PROGRESS"    │ "in_progress"    │ ❌ UPPERCASE MISMATCH      │
│ "IN_REVIEW"      │ "blocked"        │ ❌ VALUE MISMATCH          │
│ "DONE"           │ "done"           │ ❌ UPPERCASE MISMATCH      │
│                  │                  │                            │
│ ❌ 4 FAILURES    │ ✅ API TRUTH     │ → API REJECTS ALL VALUES   │
└──────────────────┴──────────────────┴────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   TASK PRIORITY MISMATCH                        │
├──────────────────┬──────────────────┬────────────────────────────┤
│ Frontend LOCAL   │ API GENERATED    │ Result                     │
│ (CURRENT)        │ (CORRECT)        │                            │
├──────────────────┼──────────────────┼────────────────────────────┤
│ "LOW"            │ "low"            │ ❌ UPPERCASE MISMATCH      │
│ "MEDIUM"         │ "medium"         │ ❌ UPPERCASE MISMATCH      │
│ "HIGH"           │ "high"           │ ❌ UPPERCASE MISMATCH      │
│ "URGENT"         │ "urgent"         │ ❌ UPPERCASE MISMATCH      │
│                  │                  │                            │
│ ❌ 4 FAILURES    │ ✅ API TRUTH     │ → API REJECTS ALL VALUES   │
└──────────────────┴──────────────────┴────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  PROJECT STATUS MISMATCH                        │
├──────────────────┬──────────────────┬────────────────────────────┤
│ Frontend LOCAL   │ API GENERATED    │ Result                     │
│ (CURRENT)        │ (CORRECT)        │                            │
├──────────────────┼──────────────────┼────────────────────────────┤
│ "ACTIVE"         │ "active"         │ ❌ UPPERCASE MISMATCH      │
│ "COMPLETED"      │ ❌ NOT IN API    │ ❌ INVALID VALUE           │
│ "ARCHIVED"       │ "archived"       │ ❌ UPPERCASE MISMATCH      │
│                  │                  │                            │
│ ❌ 2-3 FAILURES  │ ✅ API TRUTH     │ → COMPLETED BREAKS         │
└──────────────────┴──────────────────┴────────────────────────────┘
```

---

## Type Consolidation Strategy

### Strategy: Import Chain

```
LEVEL 1: Source of Truth
┌──────────────────────────────────────────┐
│ shared/api/generated/types.ts            │
│ (AUTO-GENERATED from OpenAPI)            │
│                                          │
│ ✅ UserRole, User, Project, Task, ...   │
└──────────────────────────────────────────┘
                     ▲
                     │ IMPORT (don't duplicate)
                     │
LEVEL 2: Feature Re-Exports
┌──────────────────────────────────────────┐
│ features/*/types.ts                      │
│ (RE-EXPORT + custom extensions)          │
│                                          │
│ export { User } from ...generated        │
│ export interface CurrentUser extends ... │
└──────────────────────────────────────────┘
                     ▲
                     │ IMPORT
                     │
LEVEL 3: Components/Hooks
┌──────────────────────────────────────────┐
│ features/*/components/*.tsx              │
│ features/*/hooks/useXxx.ts               │
│ features/*/api/xxx.api.ts                │
│                                          │
│ import type { User } from '../types'     │
└──────────────────────────────────────────┘
```

### Strategy: Extend When Needed

```
NEED: Project with _count
SOLUTION:

// ✅ Instead of duplicating:
export interface Project {
  id: number;
  name: string;
  _count?: { members: number; tasks: number };
}

// ✅ Do this:
import type { Project as GeneratedProject } from 'shared/api/generated/types';

export interface Project extends GeneratedProject {
  _count?: { members: number; tasks: number };
}

// ✅ Or this:
export type ProjectWithMeta = GeneratedProject & {
  _count?: { members: number; tasks: number };
};
```

---

## Files to Change Summary

```
ARCHITECTURE TREE:

shared/api/generated/types.ts ✅ SOURCE OF TRUTH (DO NOT MODIFY)
  │
  ├─ features/auth/types/index.ts ❌→✅ CONSOLIDATE (remove dups, import)
  │
  ├─ features/projects/types.ts ❌→✅ CONSOLIDATE (remove dups, import)
  │
  ├─ features/tasks/types/index.ts ❌→✅ CRITICAL (fix enums, then consolidate)
  │
  ├─ features/users/types.ts ❌→⚠️ PARTIAL (import base, keep custom)
  │
  └─ shared/permissions/can.ts ❌→✅ SMALL FIX (import UserRole)

  ├─ features/settings/types/index.ts ✅ OK (no duplicates)
  │
  └─ shared/utils/errorHandling.ts ✅ OK (matches API structure)
```

---

## Migration Execution Order

```
Week 1: CRITICAL FIXES (BLOCKS API CALLS)
  Step 1: Fix TaskStatusEnum case     [1 file]     → lowercase
  Step 2: Fix TaskPriorityEnum case   [1 file]     → lowercase
  Step 3: Fix ProjectStatus values    [1 file]     → remove COMPLETED
  Step 4: Test all form submissions   [full suite] → verify lowercase

Week 2: TYPE CONSOLIDATION (REDUCE MAINTENANCE)
  Step 5: Auth consolidation          [1 file]     → import from generated
  Step 6: Projects consolidation      [1 file]     → import from generated
  Step 7: Tasks consolidation         [1 file]     → import from generated
  Step 8: Users consolidation         [1 file]     → import from generated

Week 3: FINAL CLEANUP (QUALITY)
  Step 9: Permissions cleanup         [1 file]     → import UserRole
  Step 10: Full test suite            [100%]       → verify everything
  Step 11: Code review & merge        [PR]         → ship it!
```

---

## Verification Checkpoints

```
┌─────────────────────────────────────────────────────────────────┐
│ CHECKPOINT 1: Enum Values Fixed (Day 1)                        │
├─────────────────────────────────────────────────────────────────┤
│ ✅ TaskStatusEnum uses lowercase: "todo", "in_progress", etc.  │
│ ✅ TaskPriorityEnum uses lowercase: "low", "medium", etc.      │
│ ✅ ProjectStatus uses lowercase: "active", "archived" only     │
│ ✅ NO UPPERCASE ENUMS ANYWHERE IN CODEBASE                     │
│ ✅ TypeScript compilation clean                                │
│ ✅ Form submission tests pass                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CHECKPOINT 2: Duplicates Removed (Week 1-2)                    │
├─────────────────────────────────────────────────────────────────┤
│ ✅ User interface defined in ONLY 1 place                       │
│ ✅ UserRole type defined in ONLY 1 place                       │
│ ✅ Project interface defined in ONLY 1 place                   │
│ ✅ All feature types import from generated/types               │
│ ✅ No "import type { X } from '../types'" conflicts            │
│ ✅ TypeScript compilation clean                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CHECKPOINT 3: Full Test Pass (Week 3)                          │
├─────────────────────────────────────────────────────────────────┤
│ ✅ All unit tests pass                                         │
│ ✅ All integration tests pass                                  │
│ ✅ All E2E tests pass                                          │
│ ✅ API payloads verified (lowercase enums)                     │
│ ✅ No console errors or warnings                               │
│ ✅ Code review approved                                        │
│ ✅ READY TO MERGE                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Aspect                   | Status    | Action                            |
| ------------------------ | --------- | --------------------------------- |
| **Type Duplication**     | 🔴 45%    | Consolidate to single source      |
| **Enum Case**            | 🔴 WRONG  | Fix to lowercase immediately      |
| **ProjectStatus**        | 🔴 WRONG  | Remove COMPLETED, use lowercase   |
| **UserRole Source**      | 🟠 3x     | Import from generated only        |
| **API Compatibility**    | 🔴 BROKEN | Fix enums first, then consolidate |
| **Code Maintainability** | 🟠 POOR   | Will improve with consolidation   |
| **Type Safety**          | 🟡 WEAK   | Will improve with single source   |

**Critical Timeline: FIX ENUMS IMMEDIATELY - THEY BREAK API CALLS**
