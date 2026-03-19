# Simple Issue Management Flow

> Date: 2026-03-19
> Scope: current implemented runtime flow

---

## Overview

This document shows the current end-to-end process flow of the project from first page entry to authenticated work, issue updates, history lookup, and lead-only user management.

## Main Runtime Flow

```mermaid
flowchart TD
    A[User opens service] --> B{Valid session cookie exists?}
    B -- No --> C[/login page/]
    B -- Yes --> D[/board page/]

    C --> E[Submit email and password]
    E --> F[POST /api/auth/login]
    F --> G{Credentials valid?}
    G -- No --> H[Show login error]
    G -- Yes --> I[Create session row in SQLite]
    I --> J[Set HTTP-only signed session cookie]
    J --> D

    D --> K[Load board data]
    K --> L[Read session from cookie]
    L --> M[GET /api/issues]
    M --> N[Load issues from SQLite]
    N --> O[Render board columns]

    O --> P{User action}
    P -- Create issue --> Q[POST /api/issues]
    Q --> R[Validate title assignee due date]
    R --> S[Insert issue row]
    S --> T[Refresh board state]

    P -- Drag or edit issue --> U[PATCH /api/issues/:id]
    U --> V{Has update permission?}
    V -- No --> W[Return 403]
    V -- Yes --> X[Update issue row]
    X --> Y{Status or assignee changed?}
    Y -- Yes --> Z[Insert issue_events history rows]
    Y -- No --> T
    Z --> T

    P -- Open issue detail --> AA[GET /api/issues/:id/history]
    AA --> AB[Apply field period date page filters]
    AB --> AC[Read issue_events from SQLite]
    AC --> AD[Render detail history]

    O --> AE[/dashboard page/]
    AE --> AF[Load all issues for current session]
    AF --> AG[Compute delayed items from dueDate and status]
    AG --> AH[Render delayed summary my issues completed list]

    AH --> AI{Role is lead?}
    AI -- No --> AJ[Users menu hidden]
    AI -- Yes --> AK[/users page/]
    AK --> AL[GET /api/users]
    AL --> AM[List users]
    AK --> AN[POST /api/users]
    AN --> AO[Create teammate]
    AK --> AP[PATCH /api/users/:id]
    AP --> AQ[Update role active state password]

    D --> AR[POST /api/auth/logout]
    AR --> AS[Delete session row and clear cookie]
    AS --> C
```

## Route Responsibility Map

```mermaid
flowchart LR
    UI[Next.js App Router pages] --> API[Route Handlers]
    API --> SERVICE[Server service layer]
    SERVICE --> DB[SQLite database]

    UI --> LOGIN[/login]
    UI --> BOARD[/board]
    UI --> DASH[/dashboard]
    UI --> USERS[/users lead only]

    API --> AUTHAPI[/api/auth/login me logout]
    API --> ISSUEAPI[/api/issues and /api/issues/:id]
    API --> HISTORYAPI[/api/issues/:id/history]
    API --> USERAPI[/api/users and /api/users/:id]

    SERVICE --> AUTHSVC[auth.ts session.ts]
    SERVICE --> ISSUESVC[issues.ts]
    SERVICE --> USERSVC[users.ts]

    DB --> USERSDB[(users)]
    DB --> SESSIONSDB[(sessions)]
    DB --> ISSUESDB[(issues)]
    DB --> EVENTSDB[(issue_events)]
```

## Notes

- The root `/` route immediately redirects to `/board` or `/login` based on the session.
- `planner` users can view data but cannot update or discard issues.
- `member` users can update issues only when they are the creator or assignee.
- `lead` users can access the `/users` screen and manage teammates.
