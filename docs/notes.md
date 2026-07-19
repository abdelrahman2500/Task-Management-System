# Notes

## Product Decisions

- Keep the first version focused on projects, tasks, assignees, due dates, comments, and status tracking.
- Use soft deletion or archiving for projects and tasks when audit history matters.
- Add notifications only after the core workflow is stable.

## Open Questions

- Should tasks support subtasks in version one?
- Should projects use fixed statuses or custom workflow columns?
- Should comments support attachments?
- Which authentication provider should be used?

## Implementation Notes

- Define authorization rules before backend implementation.
- Keep API response shapes consistent across resources.
- Add validation for task status, priority, assignee, and due date.
- Prefer database constraints for ownership and membership relationships where practical.
