# PHASE 5 PART 4B — TASK 14: RETRY POLICY HARDENING

**Status**: ✅ COMPLETE

**Date**: August 13, 2026

---

## Executive Summary

Implemented a production-safe retry policy in TanStack Query that:

✅ Never retries deterministic errors (401, 403, 404, 409, 422)
✅ Retries transient errors (429, 500-504, network errors)
✅ Uses bounded exponential backoff (1s → 2s → 4s, max 30s)
✅ Respects Retry-After headers when provided
✅ Prevents authentication retry loops
✅ Protects non-idempotent mutations from automatic retry
✅ Includes 40 comprehensive test cases

---

## Problem Statement

**Previous Behavior**:

- Simple `retry: 1` configuration (retry once on any error)
- No distinction between retryable and non-retryable errors
- Could retry 401 Unauthorized, causing authentication loops
- Could retry 404 Not Found (deterministic failure)
- Could retry 409 Conflict (deterministic failure)
- Could retry 422 Validation Error (deterministic failure)

**Required Behavior**:
Production-safe retry that respects error semantics and follows HTTP standards.

---

## Solution Architecture

### Centralized Retry Configuration

**Location**: `frontend/src/shared/api/retryPolicy.ts`

```typescript
export const RETRY_CONFIG = {
  MAX_RETRIES: 3, // Maximum automatic retry attempts
  MAX_DELAY_MS: 30000, // Maximum delay between retries
  INITIAL_DELAY_MS: 1000, // 1 second for first retry
  JITTER_FACTOR: 0.1, // ±10% random jitter
};
```

### Integration Points

**1. Query Client Configuration** (`frontend/src/app/providers/QueryProvider.tsx`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryOnError, // Function-based retry decision
      retryDelay: getRetryDelay, // Dynamic delay calculation
      staleTime: 1000 * 60,
    },
    mutations: {
      retry: shouldRetryMutation, // Disabled for mutations
    },
  },
});
```

**2. Retry Decision Logic** (`shouldRetryOnError`)

```typescript
function shouldRetryOnError(
  failureCount: number,
  error: DefaultError,
): boolean {
  // Stop after 3 retries
  if (failureCount > RETRY_CONFIG.MAX_RETRIES) return false;

  // Only retry transient errors
  return isTransientError(error);
}
```

**3. Retry Delay Calculation** (`getRetryDelay`)

```typescript
function getRetryDelay(failureCount: number, error: DefaultError): number {
  // Check for Retry-After header
  if (retryAfter !== null) {
    return Math.min(retryAfter, RETRY_CONFIG.MAX_DELAY_MS);
  }

  // Exponential backoff with jitter
  const exponentialDelay = INITIAL_DELAY_MS * Math.pow(2, failureCount - 1);
  const baseDelay = Math.min(exponentialDelay, RETRY_CONFIG.MAX_DELAY_MS);
  const jitter = baseDelay * JITTER_FACTOR * Math.random();

  return Math.min(baseDelay + jitter, RETRY_CONFIG.MAX_DELAY_MS);
}
```

---

## Error Classification Matrix

| HTTP Status   | Error Type          | Retry? | Reason                              |
| ------------- | ------------------- | ------ | ----------------------------------- |
| 400           | Bad Request         | ❌ NO  | Client error - deterministic        |
| 401           | Unauthorized        | ❌ NO  | Auth error - prevent loops          |
| 403           | Forbidden           | ❌ NO  | Authorization error - deterministic |
| 404           | Not Found           | ❌ NO  | Resource missing - deterministic    |
| 409           | Conflict            | ❌ NO  | State conflict - deterministic      |
| 422           | Validation Error    | ❌ NO  | Input error - deterministic         |
| 429           | Rate Limit          | ✅ YES | Transient - respect Retry-After     |
| 500           | Server Error        | ✅ YES | Transient - server recoverable      |
| 502           | Bad Gateway         | ✅ YES | Transient - gateway recoverable     |
| 503           | Service Unavailable | ✅ YES | Transient - temporary downtime      |
| 504           | Gateway Timeout     | ✅ YES | Transient - timeout recoverable     |
| Network Error | Connection Failed   | ✅ YES | Transient - network issue           |

---

## Retry Behavior Details

### Exponential Backoff with Jitter

**Attempt Sequence**:

1. Initial attempt (immediate)
2. Retry 1: ~1000ms (1 second)
3. Retry 2: ~2000ms (2 seconds)
4. Retry 3: ~4000ms (4 seconds)

**Formula**:

```
baseDelay = INITIAL_DELAY_MS × 2^(failureCount - 1)
clampedDelay = min(baseDelay, MAX_DELAY_MS)
jitterRange = clampedDelay × JITTER_FACTOR
finalDelay = clampedDelay + random(0, jitterRange)
```

**Purpose of Jitter**:

- Prevents "thundering herd" (all clients retrying simultaneously)
- Distributes load more evenly across server recovery
- Small jitter factor (10%) keeps delays predictable

### Retry-After Header Support

**Parsing**:

- Supports integer seconds: `Retry-After: 120`
- Supports HTTP-date: `Retry-After: Wed, 21 Oct 2025 07:28:00 GMT`

**Behavior**:

1. Parse Retry-After if present
2. Convert to milliseconds
3. Clamp to MAX_DELAY_MS (30 seconds)
4. Use this delay instead of exponential backoff

**Example**:

```
Server responds: 429 Too Many Requests
Header: Retry-After: 60
Actual delay: min(60000, 30000) = 30000ms
```

### Authentication Error Protection

**No Retry Loops**:

- 401 Unauthorized is never retried
- Handled by axios response interceptor
- Triggers token cleanup and logout
- Prevents 401 → retry → 401 → retry... loop

**Implementation**:

```typescript
function isTransientError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return true;

  const status = error.response?.status;

  // Never retry 4xx except 429
  if (status && status >= 400 && status < 500) {
    if (status === 429) return true;
    return false; // All other 4xx are not retried
  }

  // Retry 5xx
  if (status && status >= 500 && status < 600) return true;

  // Retry network errors
  return !status;
}
```

### Mutation Protection

**Non-Idempotent Operations**:

- POST, PATCH, DELETE are mutations
- Mutations default to `retry: false`
- Prevents unintended side effects (duplicate creates, etc.)

**Configuration**:

```typescript
mutations: {
  retry: shouldRetryMutation, // Always returns false
}
```

**When Safe to Retry**:

- Only if mutation is idempotent
- Only if operation includes idempotency key
- Currently not enabled (future enhancement)

---

## Test Coverage

**File**: `frontend/src/shared/api/retryPolicy.test.ts`

**Test Categories** (40 tests total):

### 1. Non-Retryable Errors (6 tests)

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error

### 2. Retryable Server Errors (4 tests)

- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

### 3. Rate Limiting (1 test)

- 429 Too Many Requests with retry

### 4. Network Errors (2 tests)

- Connection failure
- No response

### 5. Maximum Retries (2 tests)

- Stops after max retries reached
- Retries up to max limit

### 6. Exponential Backoff (3 tests)

- First retry: ~1 second
- Second retry: ~2 seconds
- Third retry: ~4 seconds

### 7. Maximum Delay Clamping (1 test)

- Never exceeds 30 seconds

### 8. Jitter Behavior (2 tests)

- Jitter applied to delays
- Jitter doesn't exceed factor

### 9. Retry-After Header (4 tests)

- Respects seconds format
- Clamps to maximum delay
- Fallback for invalid header
- Fallback for missing header

### 10. Mutation Protection (3 tests)

- No retry by default
- No retry for network errors
- No retry for rate limits

### 11. Status Code Matrix (11 tests)

- All HTTP status codes tested

### 12. Configuration Validation (1 test)

- RETRY_CONFIG values are valid

**Test Results**:

```
✓ Test Files: 1 passed (1)
✓ Tests: 40 passed (40)
✓ Duration: 1.18s
```

---

## Implementation Details

### File Structure

**New Files**:

- `frontend/src/shared/api/retryPolicy.ts` (143 lines)
- `frontend/src/shared/api/retryPolicy.test.ts` (434 lines)

**Modified Files**:

- `frontend/src/app/providers/QueryProvider.tsx` (30 lines)
- `frontend/src/shared/utils/errorHandling.ts` (+17 lines for helper functions)

### Error Detection Functions

**Added to errorHandling.ts**:

```typescript
export function isServerError(error: unknown): boolean;
export function isClientError(error: unknown): boolean;
```

These support the retry policy decision making.

### No Breaking Changes

- Old `retryApiCall` utility remains (unused, can be removed later)
- All existing hooks and services continue to work
- 401 handling in axios interceptor unchanged
- QueryClient configuration extends existing setup

---

## Verification Results

### Frontend TypeScript ✅

```
✓ npx tsc --noEmit
Exit Code: 0
```

### Retry Policy Tests ✅

```
✓ Test Files: 1 passed (1)
✓ Tests: 40 passed (40)
✓ All test categories passing
✓ No regression in coverage
```

### Frontend Build ✅

```
✓ npm run build
✓ Vite built successfully
✓ 2101 modules transformed
✓ Bundle size: 828.18 KB (232.55 KB gzipped)
```

### Backend Tests ✅

```
✓ Test Files: 8 passed (8)
✓ Tests: 142 passed (142)
✓ No regressions
✓ All tests passing
```

### Code Quality Checks ✅

**Competing Retry Systems**:

- retryApiCall (unused, in errorHandling.ts): 1 instance
- Centralized retry policy: 1 instance
- Total conflicting systems: 0

**No Infinite Loops**:

- 401 never retried: ✅
- Mutations not retried: ✅
- Max retries enforced: ✅

**No Direct Retry Invocations**:

- axios.create() outside main client: 0
- Direct retry logic in hooks: 0
- Uncontrolled retry attempts: 0

---

## Retry Decision Tree

```
Error occurs
  ↓
failureCount > 3?
  ├─ YES → Stop (no more retries)
  └─ NO → Check error type
      ↓
Is 4xx error (except 429)?
  ├─ YES → Stop (deterministic error, no retry)
  └─ NO → Check error type
      ↓
Is 401, 403, or 404?
  ├─ YES → Stop (authentication/authorization/not-found)
  └─ NO → Check error type
      ↓
Is 409 or 422?
  ├─ YES → Stop (conflict/validation)
  └─ NO → Check error type
      ↓
Is 5xx or 429 or network error?
  ├─ YES → Retry with delay
  │         ↓
  │         Parse Retry-After header?
  │         ├─ YES → Use Retry-After (clamped to 30s)
  │         └─ NO → Use exponential backoff (1s, 2s, 4s, max 30s)
  └─ NO → Stop
```

---

## Configuration Recommendations

**For High-Load Scenarios**:

```typescript
RETRY_CONFIG = {
  MAX_RETRIES: 2, // Fewer retries
  MAX_DELAY_MS: 10000, // Shorter max wait
  INITIAL_DELAY_MS: 500,
  JITTER_FACTOR: 0.2, // More jitter
};
```

**For Low-Latency Scenarios**:

```typescript
RETRY_CONFIG = {
  MAX_RETRIES: 3,
  MAX_DELAY_MS: 5000, // Shorter wait
  INITIAL_DELAY_MS: 500,
  JITTER_FACTOR: 0.1,
};
```

**Current Production Config**:

```typescript
MAX_RETRIES: 3; // 3 retries = 4 attempts total
MAX_DELAY_MS: 30000; // 30 second maximum
INITIAL_DELAY_MS: 1000; // 1 second first retry
JITTER_FACTOR: 0.1; // ±10% jitter
```

Total worst-case time: ~7 seconds (1s + 2s + 4s)

---

## HTTP Semantics Compliance

**RFC 2822 - Retry-After**:
✅ Supports integer seconds format
✅ Supports HTTP-date format
✅ Clamps to maximum delay
✅ Falls back gracefully

**RFC 7231 - HTTP Semantics**:
✅ Respects 4xx as client errors (no retry)
✅ Respects 5xx as server errors (retry)
✅ 429 rate limit treated as transient
✅ 401 treated as terminal (no retry)

**JSON:API Error Format** (per spec):
✅ Error codes recognized
✅ Error messages extracted
✅ Validation errors parsed

---

## Security Considerations

### Authentication

- 401 never retried → prevents authentication loops
- Token cleanup on 401 → immediate logout
- No sensitive data in retry logs

### Rate Limiting

- 429 handled safely with Retry-After
- Respects server-specified delays
- Backoff prevents client-side DoS

### Data Integrity

- Mutations don't retry automatically
- No accidental duplicates from retries
- Non-idempotent operations protected

### Information Disclosure

- Error messages filtered appropriately
- Stack traces not exposed
- Retry internals not visible to users

---

## Monitoring & Debugging

### Identifying Retries

**In Browser DevTools**:

- Network tab shows request attempts
- Timing shows delay between attempts
- Response headers show Retry-After if present

**In Logs**:

- TanStack Query query key matches
- Request ID (from backend) matches across retries
- Same error in multiple attempts

### Identifying Issues

**High Retry Rate**:

- May indicate server instability
- May indicate network issues
- Consider increasing MAX_DELAY_MS

**No Retries on 5xx**:

- Check QueryClient configuration
- Verify retryPolicy.ts is imported
- Check error response status code

**Mutations Retrying**:

- Verify shouldRetryMutation returns false
- Check mutation configuration
- Consider side effects if unexpected retries

---

## Future Enhancements

### Idempotent Mutations

- Tag mutations as idempotent
- Include idempotency keys
- Enable safe retry for idempotent ops

### Adaptive Backoff

- Detect server health
- Adjust backoff based on error patterns
- Circuit breaker pattern

### Retry Analytics

- Track retry rates by endpoint
- Monitor success rate after retry
- Identify problematic services

### Custom Retry Policies

- Per-service retry configuration
- Per-endpoint override mechanism
- A/B testing retry strategies

---

## Rollback Plan

If issues arise:

**Revert to Simple Retry**:

```typescript
// In QueryProvider.tsx
retry: 1,  // Simple retry
```

**Disable Retries**:

```typescript
retry: false,
```

**Disable for Specific Query**:

```typescript
useQuery({
  queryKey,
  queryFn,
  retry: false, // Override for this query
});
```

---

## Summary

**Implemented**:
✅ Centralized retry policy in TanStack Query
✅ Production-safe error classification
✅ Exponential backoff with jitter
✅ Retry-After header support
✅ Authentication loop prevention
✅ Mutation protection
✅ 40 comprehensive test cases
✅ Type-safe implementation
✅ Backward compatible

**Status**: Ready for production

**Next Steps**: Monitor in production, adjust RETRY_CONFIG if needed, implement enhancements as requirements evolve.
