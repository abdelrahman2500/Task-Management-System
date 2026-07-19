# API Design

## Overview

The API follows REST conventions and exchanges JSON. Endpoints are grouped around users, projects, tasks, comments, and authentication.

Base path:

```text
/api/v1
```

## Authentication

Use bearer token authentication for protected routes.

```http
Authorization: Bearer <token>
```

## Resources

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create a user account. |
| POST | `/auth/login` | Authenticate a user. |
| POST | `/auth/logout` | Revoke the active session or token. |
| GET | `/auth/me` | Return the current user profile. |

### Projects

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/projects` | List projects visible to the current user. |
| POST | `/projects` | Create a project. |
| GET | `/projects/{projectId}` | Get project details. |
| PATCH | `/projects/{projectId}` | Update project metadata. |
| DELETE | `/projects/{projectId}` | Archive or delete a project. |

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/projects/{projectId}/tasks` | List tasks in a project. |
| POST | `/projects/{projectId}/tasks` | Create a task. |
| GET | `/tasks/{taskId}` | Get task details. |
| PATCH | `/tasks/{taskId}` | Update task fields. |
| DELETE | `/tasks/{taskId}` | Delete or archive a task. |

### Comments

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/tasks/{taskId}/comments` | List comments on a task. |
| POST | `/tasks/{taskId}/comments` | Add a task comment. |
| PATCH | `/comments/{commentId}` | Edit a comment. |
| DELETE | `/comments/{commentId}` | Delete a comment. |

## Task Object

```json
{
  "id": "task_123",
  "projectId": "project_123",
  "title": "Create API documentation",
  "description": "Document the task API endpoints.",
  "status": "todo",
  "priority": "medium",
  "assigneeId": "user_123",
  "dueDate": "2026-07-15",
  "createdAt": "2026-07-07T12:00:00Z",
  "updatedAt": "2026-07-07T12:00:00Z"
}
```

## Status Codes

| Code | Meaning |
| --- | --- |
| 200 | Successful read, update, or action (e.g. deletion with response body). |
| 201 | Resource created. |
| 204 | Successful operation with no response body. |
| 400 | Invalid request syntax (e.g. malformed JSON). |
| 401 | Authentication required or invalid credentials. |
| 403 | Permission denied. |
| 404 | Resource not found. |
| 409 | Conflict with existing state. |
| 422 | Validation failed. |
| 500 | Unexpected server error. |

## Endpoint Status Summary

| Endpoint | Method | Success Status | Possible Error Status |
| --- | --- | --- | --- |
| `POST /auth/register` | POST | 201 | 400, 409, 422 |
| `POST /auth/login` | POST | 200 | 401, 422 |
| `POST /auth/logout` | POST | 200 | 401 |
| `GET /auth/me` | GET | 200 | 401 |
| `GET /projects` | GET | 200 | 401 |
| `POST /projects` | POST | 201 | 401, 422 |
| `GET /projects/{projectId}` | GET | 200 | 401, 403, 404 |
| `PATCH /projects/{projectId}` | PATCH | 200 | 401, 403, 404, 422 |
| `DELETE /projects/{projectId}` | DELETE | 200 | 401, 403, 404 |
| `GET /projects/{projectId}/tasks` | GET | 200 | 401, 403, 404 |
| `POST /projects/{projectId}/tasks` | POST | 201 | 401, 403, 404, 422 |
| `GET /tasks/{taskId}` | GET | 200 | 401, 403, 404 |
| `PATCH /tasks/{taskId}` | PATCH | 200 | 401, 403, 404, 422 |
| `DELETE /tasks/{taskId}` | DELETE | 200 | 401, 403, 404 |
| `GET /tasks/{taskId}/comments` | GET | 200 | 401, 403, 404 |
| `POST /tasks/{taskId}/comments` | POST | 201 | 401, 403, 404, 422 |
| `PATCH /comments/{commentId}` | PATCH | 200 | 401, 403, 404, 422 |
| `DELETE /comments/{commentId}` | DELETE | 200 | 401, 403, 404 |

## Pagination

Collection endpoints should support cursor pagination.

```text
GET /api/v1/projects/{projectId}/tasks?limit=25&cursor=abc123
```

Response metadata:

```json
{
  "success": true,
  "data": [],
  "page": {
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

## Response Standards

All API responses must return a consistent JSON structure.

### Success Responses

For single resource queries or creation/update operations (e.g., `GET`, `POST`, `PATCH` on a single item), the response body wraps the data in a `data` field:

```json
{
  "success": true,
  "data": {
    "id": "task_123",
    "projectId": "project_123",
    "title": "Create API documentation",
    "description": "Document the task API endpoints.",
    "status": "todo",
    "priority": "medium",
    "assigneeId": "user_123",
    "dueDate": "2026-07-15",
    "createdAt": "2026-07-07T12:00:00Z",
    "updatedAt": "2026-07-07T12:00:00Z"
  }
}
```

For paginated collections, the response includes the `success` status, the `data` array, and a `page` object containing pagination metadata:

```json
{
  "success": true,
  "data": [
    {
      "id": "task_123",
      "projectId": "project_123",
      "title": "Create API documentation",
      "status": "todo",
      "priority": "medium"
    }
  ],
  "page": {
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

For successful operations that do not return resource data (e.g., `DELETE`, logout), the response contains a success flag and a description message:

```json
{
  "success": true,
  "message": "Resource deleted successfully."
}
```

### Error Responses

Error responses must use a standard shape to provide consistent debugging information and field-specific validation errors. The HTTP status code dictates the general category of the error (e.g., 400, 401, 403, 404, 422, 500).

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request contains invalid input parameters.",
    "details": [
      {
        "field": "title",
        "message": "Title must be between 3 and 100 characters."
      }
    ]
  }
}
```

Common Error Codes:
- `BAD_REQUEST`: The request could not be understood or is missing required parameters.
- `UNAUTHORIZED`: Authentication credentials are missing or invalid.
- `FORBIDDEN`: The user does not have permission to perform this action.
- `NOT_FOUND`: The requested resource does not exist.
- `CONFLICT`: The request conflicts with the current state of the server (e.g., duplicate email).
- `VALIDATION_FAILED`: Request payload failed input validation rules.
- `INTERNAL_SERVER_ERROR`: An unexpected server error occurred.

## Validation Rules

Below are the validation rules enforced on key API endpoints. Requests containing invalid data will return a `422 Unprocessable Entity` status code using the standard error response format.

### Auth

#### POST `/auth/register`
- `name`: Required, string, 2 to 50 characters.
- `email`: Required, valid email format, unique across users.
- `password`: Required, string, minimum 8 characters.

#### POST `/auth/login`
- `email`: Required, valid email format.
- `password`: Required, string.

### Projects

#### POST `/projects`
- `name`: Required, string, 3 to 100 characters.
- `description`: Optional, string, maximum 500 characters.

#### PATCH `/projects/{projectId}`
- `name`: Optional, string, 3 to 100 characters.
- `description`: Optional, string, maximum 500 characters.

### Tasks

#### POST `/projects/{projectId}/tasks`
- `title`: Required, string, 3 to 100 characters.
- `description`: Optional, string, maximum 1000 characters.
- `status`: Required, string, must be one of: `todo`, `in_progress`, `done`.
- `priority`: Required, string, must be one of: `low`, `medium`, `high`.
- `assigneeId`: Optional, valid user UUID (must belong to project members) or null.
- `dueDate`: Optional, valid date format (e.g., YYYY-MM-DD) or null.

#### PATCH `/tasks/{taskId}`
- `title`: Optional, string, 3 to 100 characters.
- `description`: Optional, string, maximum 1000 characters.
- `status`: Optional, string, must be one of: `todo`, `in_progress`, `done`.
- `priority`: Optional, string, must be one of: `low`, `medium`, `high`.
- `assigneeId`: Optional, valid user UUID (must belong to project members) or null.
- `dueDate`: Optional, valid date format (e.g., YYYY-MM-DD) or null.

### Comments

#### POST `/tasks/{taskId}/comments`
- `body`: Required, string, 1 to 1000 characters.

#### PATCH `/comments/{commentId}`
- `body`: Required, string, 1 to 1000 characters.
