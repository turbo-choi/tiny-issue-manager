# Simple Issue Management Database Diagram

> Date: 2026-03-19
> Source: current SQLite schema in `src/server/db.ts`

---

## Overview

This document describes the current SQLite database structure used by the project. The schema is centered on users, authenticated sessions, issues, and issue history events.

## ER Diagram

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : owns
    USERS ||--o{ ISSUES : creates
    USERS ||--o{ ISSUES : assigned_to
    ISSUES ||--o{ ISSUE_EVENTS : has
    USERS ||--o{ ISSUE_EVENTS : acts_on

    USERS {
        text id PK
        text email UK
        text name
        text role
        integer is_active
        text created_at
        text password_hash
        text password_salt
    }

    SESSIONS {
        text id PK
        text user_id FK
        text created_at
        text expires_at
    }

    ISSUES {
        text id PK
        text title
        text description
        text creator_id
        text creator_name
        text assignee_id
        text assignee_name
        text status
        text due_date
        text created_at
        text updated_at
    }

    ISSUE_EVENTS {
        text id PK
        text issue_id FK
        text actor_id
        text actor_name
        text actor_role
        text field
        text from_value
        text to_value
        text created_at
    }
```

## Table Roles

- `users`: login identity, display name, role, active state, and password hash storage
- `sessions`: server-side session records linked to the signed cookie
- `issues`: main issue records for board and dashboard rendering
- `issue_events`: audit history for status and assignee changes shown in the issue detail dialog

## Data Rules

- `users.role` uses the fixed MVP roles: `lead`, `member`, `planner`
- `issues.status` uses the fixed MVP statuses: `Todo`, `In Progress`, `Done`, `Discarded`
- delayed state is not stored as a column
- delayed state is derived from `due_date < today` and status not in `Done` or `Discarded`
- deleting an issue in the UI is implemented as a soft delete by changing status to `Discarded`

## Logical Data Flow

```mermaid
flowchart TD
    A[Login request] --> B[Validate password against users]
    B --> C[Create sessions row]
    C --> D[Signed cookie returned to browser]

    E[Issue create or update request] --> F[Check current session]
    F --> G[Read user role from users]
    G --> H[Insert or update issues row]
    H --> I{Status or assignee changed?}
    I -- Yes --> J[Insert issue_events row]
    I -- No --> K[Return updated issue]
    J --> K

    L[History request] --> M[Read issue_events by issue_id]
    M --> N[Apply field period date pagination filters]
    N --> O[Return issue history list]
```
