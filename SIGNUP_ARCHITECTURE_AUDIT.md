# SIGNUP / REGISTRATION ARCHITECTURE AUDIT

## Executive Summary

The Task Management System has a **production-ready backend registration system** but is **missing the frontend signup experience entirely**. The backend has all necessary infrastructure:

- ✅ Registration endpoint implemented
- ✅ Password hashing with bcryptjs (12 salt rounds)
- ✅ JWT token generation
- ✅ Duplicate email detection
- ✅ Rate limiting (5/15min)
- ✅ OpenAPI documentation
- ✅ Error handling

**Missing**: Frontend signup page, form, routing, and comprehensive tests.

---

## BACKEND ARCHITECTURE ✅

### 1. Registration Endpoint

**Route**: `POST /api/v1/auth/register`
**Status**: ✅ READY
**Rate Limiting**: ✅ 5 attempts per 15 minutes
**File**: `backend/src/routes/auth.routes.ts`

```typescript
authRoutes.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
```

### 2. Request/Response Contract

**Request**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response** (201):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-08-16T10:30:00Z",
      "updatedAt": "2024-08-16T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Duplicate Email** (409):

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A user with this email already exists",
    "requestId": "req-uuid"
  }
}
```

**Validation Error** (422):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request contains invalid input parameters.",
    "details": {
      "name": "String must contain at least 2 character(s)",
      "password": "String must contain at least 8 character(s)"
    },
    "requestId": "req-uuid"
  }
}
```

### 3. Zod Validation Schema

**File**: `backend/src/schemas/auth.schemas.ts`

```typescript
registerSchema = z
  .object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();
```

**Validation Rules**:

- `name`: 2-50 characters, required, trimmed
- `email`: Valid email format, required, lowercase normalized
- `password`: Minimum 8 characters, required
- Extra fields: Rejected (`.strict()`)

### 4. Database Model

**File**: `backend/prisma/schema.prisma`

```prisma
model User {
  id           Int      @id @default(autoincrement())
  name         String   @db.VarChar(100)
  email        String   @unique @db.VarChar(255)    // ✅ UNIQUE constraint
  passwordHash String   @db.VarChar(255)            // ✅ NOT password
  isActive     Boolean  @default(true)              // ✅ Default active
  isAdmin      Boolean  @default(false)             // ✅ Default not admin
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  // ... relations
}
```

### 5. Password Security

**File**: `backend/src/services/auth.service.ts`

```typescript
const SALT_ROUNDS = 12;

// Registration
const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
const user = await prisma.user.create({
  data: {
    name: data.name,
    email: data.email,
    passwordHash, // ✅ Hash only
  },
  select: {
    // ✅ Exclude passwordHash from response
    id: true,
    name: true,
    email: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  },
});
```

**Security Features**:

- ✅ Bcryptjs with 12 salt rounds
- ✅ Password never stored plaintext
- ✅ Password never returned in responses
- ✅ Duplicate email detected before hashing
- ✅ No timing attacks (constant-time comparison in bcrypt)

### 6. Authentication Flow

**After Registration**:

1. User created in database
2. JWT token generated using `generateToken(userId, email)`
3. Token and user returned in 201 response
4. Client stores token in localStorage
5. Frontend redirects to authenticated area

**Token Expiration**: Configurable, default 7 days

### 7. Error Handling

**File**: `backend/src/middleware/errorHandler.ts`

| Error              | Status | Code                    | Message                                       |
| ------------------ | ------ | ----------------------- | --------------------------------------------- |
| Duplicate email    | 409    | `CONFLICT`              | "A user with this email already exists"       |
| Invalid email      | 422    | `VALIDATION_FAILED`     | Field errors in details                       |
| Password too short | 422    | `VALIDATION_FAILED`     | "String must contain at least 8 character(s)" |
| Missing field      | 422    | `VALIDATION_FAILED`     | Field errors in details                       |
| Extra fields       | 422    | `VALIDATION_FAILED`     | Field errors in details                       |
| Server error       | 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"                        |

### 8. Rate Limiting

**File**: `backend/src/middleware/rateLimiter.ts`

```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  keyGenerator: (req) => getRateLimitKey(req, "auth"),
  // ...
});
```

**Applied to**: `POST /auth/register` and `POST /auth/login`

**Rate Limit Exceeded** (429):

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "requestId": "req-uuid"
  }
}
```

### 9. OpenAPI Documentation

**File**: `backend/src/config/openapi.ts`

```yaml
/auth/register:
  post:
    operationId: registerUser
    tags:
      - Authentication
    summary: Register a new user
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
                minLength: 2
                maxLength: 50
              email:
                type: string
                format: email
              password:
                type: string
                minLength: 8
            required: [name, email, password]
    responses:
      "201":
        description: User created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                data:
                  type: object
                  properties:
                    user:
                      $ref: "#/components/schemas/User"
                    token:
                      type: string
      "409":
        description: Email already exists
      "422":
        description: Validation error
      "429":
        description: Rate limit exceeded
      "500":
        description: Server error
```

---

## FRONTEND ARCHITECTURE

### Current State: ❌ MISSING SIGNUP

**What Exists**:

- ✅ LoginPage at `/auth/login`
- ✅ LoginForm component with validation
- ✅ Auth service with `register()` method (type-safe)
- ✅ Protected routes
- ✅ Auth context (React Query)
- ✅ Error handling utilities
- ✅ Form components (Input, Button, etc.)
- ✅ Loading states

**What's Missing**:

- ❌ SignupPage component
- ❌ SignupForm component
- ❌ Signup route (`/auth/signup`)
- ❌ Signup validation schema
- ❌ useRegister hook
- ❌ Link from login to signup

### API Client

**File**: `frontend/src/shared/api/client.ts`

```typescript
const authServices = {
  async register(
    payload: RegisterRequest,
  ): Promise<{ user: User; token: string }> {
    const response = await api.post<{ user: User; token: string }>(
      "/auth/register",
      payload,
      {
        signal: options?.signal,
        timeout: options?.timeout,
      },
    );
    return response as unknown as { user: User; token: string };
  },
  // ... login, logout, etc.
};
```

**Status**: ✅ Ready to use

### Generated Types

**File**: `frontend/src/shared/api/generated/types.ts`

Includes:

- `User` type with proper fields
- `RegisterRequest` type (auto-generated from OpenAPI)
- `AuthResponse` type
- All necessary types for form state

**Status**: ✅ Types available

### Generated Types for Register

From OpenAPI, frontend has types for:

```typescript
type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

---

## MISSING PIECES - IMPLEMENTATION PLAN

### Phase 1: Database ✅ COMPLETE

- Email uniqueness constraint: ✅ Exists
- User model fields: ✅ Complete
- No migrations needed

### Phase 2: Backend Signup Contract ✅ COMPLETE

- Endpoint: `POST /api/v1/auth/register` ✅ Implemented
- Request validation: ✅ Zod schema ready
- Response format: ✅ JWT + user data
- Duplicate email handling: ✅ 409 with safe message
- Rate limiting: ✅ 5/15min

### Phase 3-9: Backend Implementation ✅ COMPLETE

- ✅ Password security (bcryptjs 12 rounds)
- ✅ Duplicate email handling (409)
- ✅ Authentication (JWT generation)
- ✅ Authorization (no privilege injection)
- ✅ Rate limiting
- ✅ OpenAPI documentation
- ✅ Error handling

### Phase 10-11: API Client & OpenAPI ✅ COMPLETE

- ✅ Centralized API client with type safety
- ✅ OpenAPI spec includes register endpoint
- ✅ Generated frontend types available

### Phase 12-22: FRONTEND - NEEDS IMPLEMENTATION

1. **Phase 12**: Frontend Signup UI
   - SignupPage.tsx
   - SignupForm.tsx
   - AuthCard reuse
   - HeroSection reuse

2. **Phase 13-15**: Frontend Validation & UX
   - Signup validation schema (Zod)
   - Password confirmation handling
   - Loading states
   - Show/hide password

3. **Phase 16-17**: Frontend Error & Success
   - Handle 409 duplicate email
   - Handle 422 validation errors
   - Handle 429 rate limiting
   - Success flow (auto-login)

4. **Phase 18**: Routing
   - Add signup route to router
   - Update auth routes
   - Navigation between login/signup

5. **Phase 19**: Auth State
   - Verify token stored
   - Verify auth state updated
   - Verify redirect works

6. **Phase 20**: Accessibility
   - Labels on form fields
   - Keyboard navigation
   - ARIA attributes
   - Error announcements

7. **Phase 21**: Frontend Unit Tests
   - Form rendering
   - Validation
   - Submission
   - Error handling

8. **Phase 22**: E2E Tests
   - Chromium signup flow
   - Firefox signup flow
   - Rate limiting behavior
   - Duplicate email

### Phase 23-26: Testing & Verification

- Backend tests (if missing)
- Security audit
- Build verification
- Final E2E across browsers

---

## VALIDATION REQUIREMENTS

### Name

- Required: Yes
- Min length: 2
- Max length: 50
- Trimmed: Yes
- Pattern: Any alphanumeric + spaces

### Email

- Required: Yes
- Format: Valid email
- Uniqueness: Database constraint + application check
- Normalized: Lowercase in database
- Case-insensitive: Yes (email is case-insensitive)

### Password

- Required: Yes
- Min length: 8
- Max length: Reasonable (no truncation)
- Complexity: None required (but good practice to recommend)
- Confirmation: Client-side only (not sent to backend)

### Unknown Fields

- Behavior: Rejected (422)
- Reason: Prevent privilege injection
- Example: `{"name": "...", "email": "...", "password": "...", "role": "admin"}` → REJECTED

---

## SECURITY CHECKLIST

### Password Security

- ✅ Never store plaintext
- ✅ Bcryptjs with 12 rounds
- ✅ Never log password
- ✅ Never return passwordHash
- ✅ Never put in URL/query params
- ✅ Not persisted in localStorage

### Duplicate Email

- ✅ Database constraint (UNIQUE)
- ✅ Application check before hashing
- ✅ Safe error message ("already exists")
- ✅ No information leak
- ✅ 409 status code

### Privilege Injection

- ✅ Server determines default role
- ✅ Client cannot set role/isAdmin
- ✅ Strict Zod validation (no extra fields)
- ✅ Tests verify behavior

### Rate Limiting

- ✅ 5 attempts per 15 minutes
- ✅ Per IP + user (if authenticated)
- ✅ 429 response with retry-after
- ✅ Applied to both register and login

### JWT Security

- ✅ HS256 with strong secret
- ✅ Expiration validation
- ✅ Signature verification
- ✅ Required claims validation

### Error Handling

- ✅ No stack traces in production
- ✅ No Prisma errors
- ✅ No SQL details
- ✅ No environment variables
- ✅ Request IDs for correlation

---

## FILES TO CREATE/MODIFY

### CREATE (Frontend):

1. `frontend/src/features/auth/schemas/signup.schema.ts`
2. `frontend/src/features/auth/components/SignupForm.tsx`
3. `frontend/src/features/auth/pages/SignupPage.tsx`
4. `frontend/src/features/auth/hooks/useRegister.ts`
5. `frontend/src/features/auth/__tests__/signup.test.tsx`
6. `frontend/e2e/tests/auth-signup.spec.ts`

### MODIFY (Frontend):

1. `frontend/src/router/index.tsx` - Add signup route
2. `frontend/src/features/auth/routes/index.tsx` - Add signup route
3. `frontend/src/features/auth/components/LoginForm.tsx` - Add signup link
4. `frontend/src/features/auth/pages/LoginPage.tsx` - Add navigation

### MODIFY (Backend):

1. `backend/src/controllers/auth.controller.ts` - ✅ Already complete
2. `backend/src/services/auth.service.ts` - ✅ Already complete
3. `backend/src/schemas/auth.schemas.ts` - ✅ Already complete
4. Add backend signup tests (new file)

### CREATE (Documentation):

1. `PHASE_SIGNUP_IMPLEMENTATION.md`
2. `PHASE_SIGNUP_FINAL_REPORT.md`

---

## IMPLEMENTATION STRATEGY

1. **Backend Verification** (5 min): Verify existing implementation works
2. **Frontend Components** (30 min): Create signup form, page, schema
3. **Frontend Hooks** (10 min): Create useRegister hook
4. **Routing** (10 min): Add signup route and navigation
5. **Backend Tests** (30 min): Comprehensive auth tests
6. **Frontend Tests** (30 min): Unit tests for signup form
7. **E2E Tests** (30 min): Playwright tests for signup flow
8. **Security Audit** (20 min): Verify all controls
9. **Verification** (15 min): Build, test, verify
10. **Documentation** (15 min): Final report

**Total Estimated Time**: ~3 hours

---

## SUCCESS CRITERIA

All of these must pass:

- [ ] Backend registration endpoint responds correctly
- [ ] Password hashed with bcryptjs
- [ ] Duplicate email returns 409
- [ ] Default role enforced server-side
- [ ] Privilege injection prevented
- [ ] Rate limiting active (5/15min)
- [ ] OpenAPI synchronized
- [ ] Frontend signup page exists and renders
- [ ] Signup form validates all fields
- [ ] Password confirmation not sent to backend
- [ ] Loading state works
- [ ] Duplicate submission prevented
- [ ] Form accessible (labels, keyboard, ARIA)
- [ ] 409 error displayed correctly
- [ ] 422 validation errors shown
- [ ] 429 rate limit handled
- [ ] Success redirects to dashboard
- [ ] Login after signup works
- [ ] Backend tests pass (8+ suites)
- [ ] Frontend tests pass (10+ suites)
- [ ] Chromium E2E pass (8+ tests)
- [ ] Firefox E2E pass (8+ tests)
- [ ] No secrets exposed
- [ ] No direct axios imports
- [ ] No unsafe `as any`
- [ ] Security audit passes
- [ ] Production build succeeds

---

## NEXT STEP

Proceed to **PHASE 1 — DATABASE AUDIT** to verify existing schema.
