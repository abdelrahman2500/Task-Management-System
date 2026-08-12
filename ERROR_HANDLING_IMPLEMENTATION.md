# Error Handling Implementation - Complete Guide

## Overview

Task 11 implemented comprehensive, standardized error handling across the entire application. All API errors now follow a single contract format, sensitive data is protected, and the system is tested with 20 dedicated tests.

---

## Key Changes

### 1. Backend Error Handler (Enhanced)

**File**: `backend/src/middleware/errorHandler.ts`

**Features**:

- Standardized error response format for all error types
- Zod validation error handling with field-level details (422)
- Prisma error mapping without exposing internals
- Development-only error logging
- Security-focused: no stack traces, SQL, or internal details

**Before**: Multiple error formats, potential security issues
**After**: Single standardized contract, zero sensitive data exposure

### 2. Backend Error Messages (New)

**File**: `backend/src/lib/errorMessages.ts`

Centralized mapping of error codes to user-friendly messages:

```typescript
UNAUTHORIZED: "Your session has expired. Please sign in again.";
FORBIDDEN: "You don't have permission to perform this action.";
CONFLICT: "A record with this field already exists.";
NOT_FOUND: "The requested resource was not found.";
```

### 3. Frontend Error Handling (Enhanced)

**File**: `frontend/src/shared/utils/errorHandling.ts`

New comprehensive utilities:

- `getErrorMessage(error)` - Extract message from any error
- `isValidationError(error)` - Check if validation error
- `extractValidationErrors(error)` - Get field-level errors
- `handleApiError(error, context)` - Centralized handler
- `createUserFriendlyError()` - Format for UI
- `retryApiCall()` - Smart retry logic
- Type checkers: `isUnauthorizedError()`, `isForbiddenError()`, etc.

**Before**: Error handling scattered across components
**After**: Centralized utilities, consistent across app

### 4. Frontend Error Messages (New)

**File**: `frontend/src/shared/utils/errorMessages.ts`

Maps backend error codes and HTTP status codes to user-friendly messages:

```typescript
getErrorMessageForCode("FORBIDDEN")
  → "You don't have permission to perform this action."

getErrorMessageForStatus(401)
  → "Your session has expired. Please sign in again."
```

### 5. Auth Hook Fix

**File**: `frontend/src/features/auth/hooks/useLogin.ts`

**Before**:

```typescript
import { handleApiError } from "../../shared/utils/errorHandling";
```

**After**:

```typescript
import { handleApiError } from "../../../shared/utils/errorHandling";
```

Fixed import path and using standardized error handling.

### 6. Error Handler Tests (New)

**File**: `backend/src/middleware/errorHandler.test.ts`

20 comprehensive tests covering:

- HTTP status codes (7 tests)
- Error response format (4 tests)
- Zod validation errors (2 tests)
- Security - no data exposure (3 tests)
- Error details handling (2 tests)
- Generic error handling (2 tests)

All tests passing ✅

---

## Standardized API Response Contract

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": {}
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## Error Code to HTTP Status Mapping

| HTTP Status | Error Code            | Meaning                            |
| ----------- | --------------------- | ---------------------------------- |
| 400         | BAD_REQUEST           | Invalid request parameters         |
| 401         | UNAUTHORIZED          | Missing or invalid authentication  |
| 403         | FORBIDDEN             | Authenticated but not authorized   |
| 404         | NOT_FOUND             | Resource does not exist            |
| 409         | CONFLICT              | Unique constraint, resource exists |
| 422         | VALIDATION_FAILED     | Invalid request data               |
| 500         | INTERNAL_SERVER_ERROR | Unexpected server error            |

---

## Error Handling Flow

### Backend

1. Controller calls service method
2. Service throws AppError or other error
3. Controller catches and calls `next(error)`
4. Global errorHandler catches all errors
5. errorHandler determines:
   - Is it a Zod validation error? → 422
   - Is it an AppError? → Use statusCode/code/message
   - Is it a Prisma error? → Map to safe error
   - Unknown? → 500 INTERNAL_SERVER_ERROR
6. Response returned in standardized format

### Frontend

1. Component calls API method via hook
2. Axios interceptor handles request/response
3. Mutation/Query catches error
4. Use `handleApiError()` or `createUserFriendlyError()`
5. Extract user-friendly message
6. Show toast or display inline

---

## Security Measures

### Never Exposed in API Errors

- ❌ Stack traces
- ❌ SQL errors or queries
- ❌ Prisma internals or ORM details
- ❌ Database credentials
- ❌ JWT secrets
- ❌ Filesystem paths
- ❌ Environment variables
- ❌ Internal service implementation
- ❌ Passwords or password hashes

### Prisma Error Mapping

```typescript
// P2002 (Unique constraint) → 409 CONFLICT
{
  "code": "CONFLICT",
  "message": "A record with this email already exists."
}

// P2003 (Foreign key) → 400 BAD_REQUEST
{
  "code": "BAD_REQUEST",
  "message": "The referenced record does not exist."
}

// P2025 (Record not found) → 404 NOT_FOUND
{
  "code": "NOT_FOUND",
  "message": "The requested record was not found."
}

// Other Prisma errors → 500 INTERNAL_SERVER_ERROR
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Please try again later."
}
```

---

## Frontend Error Utilities Usage

### Extract Error Message

```typescript
import { getErrorMessage } from "../utils/errorHandling";

try {
  await apiCall();
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message);
}
```

### Check Error Type

```typescript
import { isValidationError, isUnauthorizedError } from "../utils/errorHandling";

if (isValidationError(error)) {
  showValidationErrors(error);
} else if (isUnauthorizedError(error)) {
  redirectToLogin();
}
```

### Extract Validation Errors

```typescript
import { extractValidationErrors } from "../utils/errorHandling";

const fieldErrors = extractValidationErrors(error);
// {
//   email: "Invalid email",
//   password: "Must be at least 8 characters"
// }
```

### Centralized Error Handling

```typescript
import { handleApiError } from "../utils/errorHandling";

useMutation({
  mutationFn: updateProject,
  onError: (error) => {
    const message = handleApiError(error, "update project");
    toast.error(message);
  },
});
```

### User-Friendly Error Creation

```typescript
import { createUserFriendlyError } from "../utils/errorHandling";

const { message, isValidation, fieldErrors } = createUserFriendlyError(error);
// message: "Your session has expired. Please sign in again."
// isValidation: false
// fieldErrors: {}
```

### Smart Retry Logic

```typescript
import { retryApiCall } from "../utils/errorHandling";

const data = await retryApiCall(
  () => apiService.fetchData(),
  3, // maxRetries
  1000, // delayMs
);
// Retries on server errors (5xx) but not client errors (4xx)
// Uses exponential backoff
```

---

## Backend Error Classes

All error classes extend `AppError` with proper HTTP status codes:

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {}
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super(422, "VALIDATION_FAILED", "Invalid input", details);
  }
}
```

---

## Controller Pattern

All controllers follow the same error handling pattern:

```typescript
export async function getProject(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectId = Number(req.params.projectId);
    const project = await projectService.getProject(
      projectId,
      req.user!.userId,
    );
    sendSuccess(res, project); // ← Standardized response
  } catch (error) {
    next(error); // ← Delegate to global error handler
  }
}
```

No manual error response formatting in controllers. All errors bubbled to global handler.

---

## Validation Error Handling

Zod validation errors are automatically caught and formatted:

```typescript
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

// Invalid request
POST /api/v1/auth/register
{
  "email": "not-an-email",
  "password": "short"
}

// Response (422)
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request contains invalid input parameters.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email"
      },
      {
        "field": "password",
        "message": "Must be at least 8 characters"
      }
    ]
  }
}
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test

# Results: 69/69 PASS
# - 20 Error Handler Tests
# - 17 Security Tests
# - 20 Pagination Tests
# - 12 Task Service Tests
```

### Test Coverage

- HTTP status codes (7 tests)
- Error response format (4 tests)
- Zod validation (2 tests)
- Security - no data exposure (3 tests)
- Error details (2 tests)
- Generic errors (2 tests)

---

## Production Readiness Checklist

- ✅ Single standardized error contract
- ✅ No sensitive data exposure
- ✅ Comprehensive error testing
- ✅ Backend and frontend builds passing
- ✅ All 69 tests passing
- ✅ Zod validation handling
- ✅ Prisma error mapping
- ✅ User-friendly error messages
- ✅ Development-only logging
- ✅ Proper HTTP status codes
- ✅ Error details for field validation
- ✅ Consistent frontend/backend error handling
- ✅ Authorization error handling
- ✅ Authentication error handling

---

## Integration with Existing Code

### App.ts Setup

```typescript
import { errorHandler } from "./middleware/errorHandler";

app.use(routes);
app.use(notFound);
app.use(errorHandler); // ← Global error handler
```

### Controllers

All controllers delegate errors automatically - no changes needed.

### Services

Services throw appropriate AppError classes - no changes needed.

### Frontend Hooks

Use `handleApiError()` in mutation/query error handlers.

---

## Example Scenarios

### Scenario 1: Validation Error

```
User submits form with invalid email

1. Frontend validates with Zod schema
2. If passes, sends to backend
3. Backend middleware validates with Zod
4. Zod fails on invalid data
5. errorHandler catches ZodError
6. Returns 422 with field-level errors
7. Frontend extracts validation errors
8. Shows errors next to form fields
```

### Scenario 2: Authorization Error

```
User tries to update project they don't own

1. Controller calls projectService.updateProject()
2. Service checks authorization with canUpdateProject()
3. Check fails
4. Service throws new ForbiddenError("No access")
5. Controller catches with next(error)
6. errorHandler catches ForbiddenError
7. Returns 403 FORBIDDEN
8. Frontend detects 403
9. Shows "You don't have permission" message
```

### Scenario 3: Not Found Error

```
User tries to access deleted task

1. Controller calls taskService.getTask(id)
2. Service queries database
3. Prisma returns null
4. Service throws new NotFoundError("Task")
5. Controller catches with next(error)
6. errorHandler catches NotFoundError
7. Returns 404 NOT_FOUND
8. Frontend detects 404
9. Shows "Task not found" message
```

### Scenario 4: Database Conflict

```
User tries to register with existing email

1. Controller calls authService.register()
2. Service creates user in database
3. Prisma unique constraint fails (P2002)
4. Prisma throws PrismaClientKnownRequestError
5. errorHandler catches Prisma error
6. Maps P2002 to 409 CONFLICT
7. Returns safe message about email already existing
8. Frontend shows "User already exists" message
```

### Scenario 5: Unexpected Error

```
Unexpected error occurs

1. Some code throws unexpected error
2. Controller catches with next(error)
3. errorHandler catches unknown error
4. In development: logs full error to console
5. In production: logs only to secure logger
6. Returns 500 with generic message
7. Frontend shows "Something went wrong" message
8. No sensitive information exposed
```

---

## Documentation

All error handling code includes comprehensive JSDoc comments explaining:

- Purpose of each function
- Parameters and return types
- Examples of usage
- Error cases handled

---

## Next Steps

With error handling standardized, the next phases are:

1. **PHASE 3 PART 4**: Loading States and Error Boundaries
2. **PHASE 3 PART 5**: Rate Limiting and Request Validation
3. **PHASE 3 PART 6**: Comprehensive API Logging
4. **PHASE 4**: API Documentation (Swagger/OpenAPI)

The error handling infrastructure is production-ready and will support all future features.
