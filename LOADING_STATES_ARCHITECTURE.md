# Production-Ready Loading States Architecture

**Phase**: PHASE 3 PART 4  
**Date**: August 12, 2026  
**Status**: Implementation in progress

---

## Overview

Production-ready loading states provide immediate, clear feedback to users during async operations. This document outlines the implementation pattern used throughout the application.

---

## Core Principles

1. **Skeleton Over Spinner**: Use animated skeletons for initial data loading (preserves layout)
2. **Disabled Over Hidden**: Disable controls during mutations instead of hiding them
3. **Visual Clarity**: Show "Loading...", "Saving...", "Deleting..." labels
4. **No Flicker**: Prevent showing content → blank → content transitions
5. **Accessibility**: Use `aria-busy`, `aria-disabled` appropriately
6. **Prevent Duplicates**: Disable buttons during mutations to prevent double-clicks
7. **Background Fetches**: Keep existing data visible during refetches

---

## Query Loading States (Fetch Operations)

### Initial Load

When a query first loads (no cached data), show a skeleton:

```typescript
const { data, isLoading, isFetching } = useQuery({...});

if (isLoading) {
  return <ProjectSkeleton />;
}

return <ProjectList projects={data} />;
```

### Background Refetch

When data is already cached and the background refetch runs, keep existing content visible:

```typescript
const { data, isFetching } = useQuery({...});

return (
  <div>
    <ProjectList projects={data} />
    {isFetching && (
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Refreshing...
      </div>
    )}
  </div>
);
```

### Difference: isLoading vs isFetching

- **isLoading**: Initial fetch (no cached data yet)
- **isFetching**: Any fetch (initial OR background refetch)

```typescript
// Use isLoading for initial skeleton
if (isLoading) return <Skeleton />;

// Use isFetching for optional background indicator
if (isFetching) return <subtle-refresh-indicator />;
```

---

## Mutation Loading States (Action Operations)

### Button Mutations

When a button triggers an action, show loading state:

```typescript
const { mutate, isPending } = useUpdateProject();

<Button loading={isPending} onClick={() => mutate(data)}>
  {isPending ? "Saving..." : "Save"}
</Button>
```

The Button component automatically:

- Disables itself (`disabled={isPending}`)
- Shows loading spinner
- Replaces children with "Loading..."
- Sets `aria-busy={true}`

### Form Mutations

When a form is being submitted, disable all inputs:

```typescript
const { mutate, isPending } = useUpdateProject();

<form onSubmit={handleSubmit}>
  <fieldset disabled={isPending} className="space-y-4">
    <Input {...register('name')} />
    <Input {...register('description')} />

    <div className="flex gap-3">
      <Button type="button" disabled={isPending} onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" loading={isPending}>
        Save
      </Button>
    </div>
  </fieldset>
</form>
```

The `fieldset[disabled]` automatically:

- Disables all form inputs
- Reduces opacity (CSS: `disabled:opacity-60`)
- Prevents cursor interaction

### Modal Mutations

When a modal contains a mutation, prevent closing:

```typescript
const { mutate, isPending } = useDeleteProject();

<Dialog
  open={open}
  title="Delete Project"
  onClose={onClose}
  closeDisabled={isPending}  // ← Prevents close button click
>
  <div>
    <p>Are you sure?</p>
    <Button
      variant="danger"
      loading={isPending}
      onClick={() => mutate(projectId)}
    >
      Delete
    </Button>
  </div>
</Dialog>
```

---

## Skeleton Components

### For Lists/Grids

```typescript
// ProjectSkeleton - Shows 6 placeholder cards
<ProjectSkeleton />

// TaskSkeleton - Shows table/card responsive skeletons
<TaskSkeleton />

// UserSkeleton - Shows row skeletons with avatars
<UserSkeleton />
```

### For Details/Dialogs

```typescript
// DetailSkeleton - Shows title, fields, etc.
<DetailSkeleton />
```

### Generic Skeleton

```typescript
// Create custom skeletons by combining Skeleton components
<div className="space-y-4">
  <Skeleton className="h-8 w-1/2" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>
```

---

## Button Component API

The Button component handles loading states automatically:

```typescript
interface ButtonProps {
  loading?: boolean;  // Show spinner + disable
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean; // Additional disable (can combine with loading)
}

// Usage
<Button loading={isPending} onClick={handleSave}>
  Save
</Button>

// When loading=true:
// - Icon: Loader2 spinner
// - Text: "Loading..."
// - Children are hidden
// - disabled={true}
// - aria-busy={true}
// - Reduced opacity

// When loading=false:
// - Shows children
// - Not disabled (unless disabled={true})
// - Normal appearance
```

---

## TanStack Query Integration

### Query Initialization

Use these options to optimize loading states:

```typescript
const { data, isLoading, isFetching } = useQuery({
  queryKey: ["projects", params],
  queryFn: () => apiService.listProjects(params),

  // Optional: Cache data between requests
  staleTime: 1000 * 60, // 1 minute
  gcTime: 1000 * 60 * 5, // 5 minutes (was cacheTime)

  // Optional: Initial data for better UX
  placeholderData: previousData,

  // Optional: Retry on failure
  retry: 1,
});
```

### Mutation Initialization

```typescript
const mutation = useMutation({
  mutationFn: (payload) => apiService.updateProject(payload),

  // Success: refetch related queries
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  },

  // Error: preserved by error handler
  onError: (error) => {
    // Already handled by error handler
    // Shows toast automatically
  },
});

// Access states
mutation.isPending; // Mutation in progress
mutation.isError; // Mutation failed
mutation.isSuccess; // Mutation succeeded
```

---

## Preventing Duplicate Submissions

### Primary: Button Disabled State

The Button component automatically disables during loading:

```typescript
<Button loading={isPending} onClick={handleSave}>
  Save
</Button>

// Button is automatically disabled while loading
// User cannot click again until request completes
```

### Secondary: Debounced Mutation (Advanced)

For additional protection, use the debounced mutation hook:

```typescript
import { useDebouncedMutation } from '@/shared/hooks/useDebouncedMutation';

const { mutate, isPending } = useCreateProject();
const debouncedMutate = useDebouncedMutation(mutate, 300);

// Now even rapid clicks are debounced
<Button loading={isPending} onClick={() => debouncedMutate(data)}>
  Save
</Button>
```

---

## Loading State Patterns

### Pattern 1: Query Loading (Page Load)

```typescript
const { data, isLoading, isError } = useQuery({...});

if (isLoading) return <Skeleton />;
if (isError) return <ErrorState />;
if (!data || data.length === 0) return <EmptyState />;

return <Content data={data} />;
```

### Pattern 2: Mutation Loading (Button)

```typescript
const { mutate, isPending } = useMutation({...});

<button
  disabled={isPending}
  onClick={() => mutate(payload)}
>
  {isPending ? "Saving..." : "Save"}
</button>
```

### Pattern 3: Form Loading

```typescript
<form onSubmit={handleSubmit}>
  <fieldset disabled={isPending}>
    <Input {...register('name')} />
    <Button type="submit" loading={isPending}>
      Save
    </Button>
  </fieldset>
</form>
```

### Pattern 4: Modal Loading

```typescript
<Dialog closeDisabled={isPending}>
  <fieldset disabled={isPending}>
    <Input {...register('name')} />
    <Button loading={isPending} onClick={handleSubmit}>
      Save
    </Button>
  </fieldset>
</Dialog>
```

### Pattern 5: Background Refetch

```typescript
<div>
  <Content data={data} />
  {isFetching && (
    <RefreshIndicator />
  )}
</div>
```

---

## Accessibility Requirements

### aria-busy

Use on loading containers:

```typescript
<div aria-busy={isLoading} aria-label="Loading projects">
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

### aria-disabled

Use on buttons/controls:

```typescript
<button aria-disabled={isPending} disabled={isPending}>
  Save
</button>
```

### aria-label

Use on spinners without text:

```typescript
<Spinner aria-label="Saving changes" />
```

### Screen Reader Announcements

Use for important state changes:

```typescript
{isSuccess && (
  <div role="status" aria-live="polite">
    Project saved successfully
  </div>
)}
```

---

## Error Handling Integration

Loading states work seamlessly with standardized error handling:

```typescript
const { mutate, isPending, isError } = useMutation({...});

<div>
  <Button loading={isPending} onClick={() => mutate(data)}>
    Save
  </Button>

  {isError && (
    <ErrorAlert error={error} />
  )}
</div>
```

The error handler automatically:

- Shows user-friendly error message
- Doesn't require manual error display
- Works with existing Toast UI

---

## Performance Considerations

### Query Caching

- Use `staleTime` to avoid unnecessary refetches
- Use `gcTime` to keep data in cache for fast returns

### Skeleton Loading

- Skeletons are lightweight (animated divs)
- No component re-renders during loading
- Reduces visual jank

### Mutation Optimization

- Use `optimisticUpdateQueryData` for instant UI feedback
- Combine with error rollback for safety
- Prevents loading state from blocking users

### Preventing Over-Fetching

- Only enable retry on specific errors
- Use proper query keys to avoid cache pollution
- Invalidate only necessary queries on success

---

## Common Patterns and Best Practices

### ✅ DO

- Show skeletons for initial loads
- Disable buttons during mutations
- Use "Saving...", "Deleting..." labels
- Prevent close/escape during destructive mutations
- Disable form inputs with fieldset during submission
- Show subtle refresh indicator for background fetches

### ❌ DON'T

- Replace content with full spinner during background refetch
- Show "Loading..." for every state change
- Clear form values before mutation succeeds
- Allow double-clicks on buttons
- Show spinner bigger than content it replaces
- Break existing error handling

---

## Implementation Checklist

- [x] Button component shows "Loading..." on load
- [x] ProjectForm disables inputs during mutation
- [x] TaskForm disables inputs during mutation
- [x] ProjectSkeleton component for initial load
- [x] TaskSkeleton component for initial load
- [x] UserSkeleton component for initial load
- [x] Modals prevent closing during mutations
- [x] Buttons prevent clicking during mutations
- [x] Forms prevent submission during mutations
- [x] Background fetches keep existing content visible
- [x] Accessibility attributes (aria-busy, aria-disabled)
- [x] Error handling integration
- [ ] Unit tests for loading state behavior
- [ ] E2E tests for mutation flows

---

## Migration Path for Existing Components

### Before

```typescript
<Button onClick={handleSave}>
  Save
</Button>
```

### After

```typescript
const { mutate, isPending } = useUpdateProject();

<Button
  loading={isPending}
  onClick={() => mutate(data)}
>
  Save
</Button>
```

---

## Future Enhancements

1. **Progress Indicators**: Show upload progress for long-running operations
2. **Optimistic Updates**: Show changes immediately before server confirmation
3. **Success Animations**: Brief celebration for important actions
4. **Timeout Handling**: Handle requests that take too long
5. **Retry Logic**: Automatic retry with exponential backoff
6. **Loading Context**: Global loading state across app

---

## Testing Loading States

### Test Coverage

1. Initial query shows skeleton
2. Successful query removes skeleton
3. Empty state appears after loading
4. Mutation disables submit button
5. Mutation shows pending label
6. Duplicate submission prevented
7. Mutation success restores normal state
8. Mutation error shows error UI
9. Background refetch keeps data visible
10. Pagination doesn't unnecessarily blank list

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hook Form Loading](https://react-hook-form.com/)
- [WAI-ARIA: aria-busy](https://www.w3.org/WAI/PF/aria-practices/#focus_ultimate)
- [Loading State UX Patterns](https://www.smashingmagazine.com/2016/12/designing-better-error-messages-ux-guidelines/)
