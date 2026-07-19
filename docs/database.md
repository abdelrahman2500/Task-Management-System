# Database Design

## Overview

The database stores users, projects, tasks, comments, and project membership records. It uses integer primary keys for simple relational modeling and clear foreign key relationships.

## Core Tables

### users

| Column | Type | PK | FK |
| --- | --- | --- | --- |
| id | INT | Yes | No |
| name | VARCHAR(100) | No | No |
| email | VARCHAR(255) | No | No |
| password_hash | VARCHAR(255) | No | No |
| created_at | TIMESTAMP | No | No |
| updated_at | TIMESTAMP | No | No |
| is_active | BOOLEAN | No | No |

### projects

| Column | Type | PK | FK |
| --- | --- | --- | --- |
| id | INT | Yes | No |
| owner_id | INT | No | Yes, references `users.id` |
| name | VARCHAR(100) | No | No |
| description | TEXT | No | No |
| created_at | TIMESTAMP | No | No |
| updated_at | TIMESTAMP | No | No |
| status | VARCHAR(30) | No | No |


### tasks

| Column | Type | PK | FK |
| --- | --- | --- | --- |
| id | INT | Yes | No |
| project_id | INT | No | Yes, references `projects.id` |
| assignee_id | INT | No | Yes, references `users.id` |
| created_by | INT | No | Yes, references `users.id` |
| title | VARCHAR(100) | No | No |
| description | TEXT | No | No |
| status | VARCHAR(30) | No | No |
| priority | VARCHAR(30) | No | No |
| due_date | DATE | No | No |
| created_at | TIMESTAMP | No | No |
| updated_at | TIMESTAMP | No | No |

### comments

| Column | Type | PK | FK |
| --- | --- | --- | --- |
| id | INT | Yes | No |
| task_id | INT | No | Yes, references `tasks.id` |
| author_id | INT | No | Yes, references `users.id` |
| body | TEXT | No | No |
| created_at | TIMESTAMP | No | No |
| updated_at | TIMESTAMP | No | No |

### project_members

| Column | Type | PK | FK |
| --- | --- | --- | --- |
| project_id | INT | Yes | Yes, references `projects.id` |
| user_id | INT | Yes | Yes, references `users.id` |
| role | VARCHAR(30) | No | No |
| created_at | TIMESTAMP | No | No |

## Relationships

```text
Users (1) --------< Projects

Users (1) ----< Tasks (created_by)

Users (1) ----< Tasks (assignee_id)

Projects (1) -----< Tasks

Tasks (1) --------< Comments

Users (1) --------< Comments

Users (*) --------< ProjectMembers >-------- (*) Projects
```

## Relationship Details

- `projects.owner_id` links each project to the user who owns it.
- `tasks.project_id` links each task to one project.
- `tasks.assignee_id` links a task to the assigned user. This value can be null when a task is unassigned.
- `tasks.created_by` links a task to the user who created it.
- `comments.task_id` links each comment to one task.
- `comments.author_id` links each comment to the user who wrote it.
- `project_members.project_id` and `project_members.user_id` create a many-to-many relationship between users and projects.

## Recommended Constraints

- `users.email` should be unique.
- `project_members` should use a composite primary key: (`project_id`, `user_id`).
- `status` in `tasks` should be limited to values such as `todo`, `in_progress`, `blocked`, and `done`.
- `priority` in `tasks` should be limited to values such as `low`, `medium`, `high`, and `urgent`.
- `role` in `project_members` should be limited to values such as `owner`, `admin`, `member`, and `viewer`.

## Recommended Indexes

- `users.email`
- `projects.owner_id`
- `tasks.project_id`
- `tasks.assignee_id`
- `tasks.status`
- `tasks.due_date`
- `comments.task_id`
- `comments.author_id`
- `project_members.user_id`
