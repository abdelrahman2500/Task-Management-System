# Frontend Testing Guide

This directory contains the testing infrastructure and test suites for the Task Management System frontend.

## Testing Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Environment**: jsdom
- **Coverage**: Vitest coverage (v8)

## Directory Structure

```
src/tests/
├── README.md              # This file
├── setup.ts              # Global test setup
├── helpers.tsx           # Test utilities and custom render
├── mocks/
│   └── server.ts         # MSW server configuration
└── integration/          # Integration tests
    └── userWorkflow.test.tsx

src/features/*/
├── *.test.tsx           # Component tests
├── hooks/*.test.tsx     # Hook tests
└── api/*.test.ts        # API service tests

src/shared/
├── components/*.test.tsx # Shared component tests
├── utils/*.test.ts      # Utility function tests
└── permissions/*.test.ts # Permission logic tests
```

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Writing Tests

### Component Testing

Use the custom `renderWithProviders` helper to ensure components have access to React Query, Router, and other providers:

```tsx
import { renderWithProviders, screen, userEvent } from "../tests/helpers";
import MyComponent from "./MyComponent";

it("renders and handles user interaction", async () => {
  const user = userEvent.setup();

  renderWithProviders(<MyComponent />);

  const button = screen.getByRole("button", { name: /submit/i });
  await user.click(button);

  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

### Hook Testing

Test custom hooks using React Testing Library's `renderHook`:

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { useMyHook } from "./useMyHook";

it("fetches data successfully", async () => {
  const { result } = renderHook(() => useMyHook(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data).toBeDefined();
});
```

### API Testing

Mock API calls are handled by MSW. The server is configured in `tests/mocks/server.ts`:

```tsx
// API tests automatically use mocked endpoints
it("handles API errors", async () => {
  server.use(
    http.post("/api/v1/auth/login", () => {
      return HttpResponse.json(
        { success: false, error: { message: "Invalid credentials" } },
        { status: 401 },
      );
    }),
  );

  // Test error handling
});
```

## Test Categories

### Unit Tests

- Individual component rendering
- Hook behavior
- Utility functions
- Permission logic

### Integration Tests

- User workflows (login → navigate → interact)
- Form submissions with validation
- Error handling flows
- Route protection

### Mock Data

The MSW server provides realistic API responses for:

- Authentication (login, current user)
- Projects (CRUD operations)
- Tasks (CRUD operations)
- Users (admin endpoints)

## Test Utilities

### `renderWithProviders`

Renders components with all necessary providers (React Query, Router, Toast).

### `mockAuthUser` / `clearAuthUser`

Helper functions to simulate authenticated/unauthenticated states.

### User Events

Always use `userEvent.setup()` for realistic user interactions.

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users can do, not internal component state
   - Use accessible queries (`getByRole`, `getByLabelText`)

2. **Wait for Async Operations**
   - Use `waitFor` for async state changes
   - Use `findBy*` queries for elements that appear asynchronously

3. **Mock External Dependencies**
   - API calls are mocked by MSW
   - Date functions should be mocked for consistency

4. **Descriptive Test Names**
   - Describe the behavior being tested
   - Include the expected outcome

5. **Arrange, Act, Assert**
   - Set up the component/state
   - Perform the user action
   - Verify the expected result

## Common Patterns

### Testing Forms

```tsx
it("submits form with valid data", async () => {
  const user = userEvent.setup();
  renderWithProviders(<LoginForm />);

  await user.type(screen.getByLabelText(/email/i), "test@example.com");
  await user.type(screen.getByLabelText(/password/i), "Password1!");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: /submit/i }),
    ).not.toBeInTheDocument();
  });
});
```

### Testing Error States

```tsx
it("displays error message on failure", async () => {
  server.use(http.post("/api/v1/auth/login", () => HttpResponse.error()));

  // Trigger the error...

  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

### Testing Loading States

```tsx
it("shows loading spinner while submitting", async () => {
  const user = userEvent.setup();
  renderWithProviders(<MyForm />);

  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(screen.getByRole("status")).toBeInTheDocument(); // Loading spinner
});
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Focus on testing critical user paths and error scenarios rather than achieving 100% coverage.
