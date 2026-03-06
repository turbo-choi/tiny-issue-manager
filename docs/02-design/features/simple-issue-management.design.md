# simple-issue-management - Design Document (Starter)

> Version: 1.0.0 | Date: 2026-03-06 | Status: Approved
> Level: Starter | Plan: docs/01-plan/features/simple-issue-management.plan.md

---

## 1. Overview

This feature provides a lightweight issue management web service with only the flows needed for daily team work:

- fast issue registration
- board-based status tracking
- delayed issue monitoring
- personal issue status lookup

The design keeps the user experience Starter-level simple while using a built-in backend because login, user management, role control, and persistent data are required.

## 2. Design Goals

- Keep the MVP to two primary screens: `Board` and `Dashboard`
- Let a logged-in user register an issue in under one minute
- Make status change feel immediate through drag and drop
- Make delayed issues visible without navigation depth
- Keep the implementation feasible for one developer in one week

## 3. Technical Decisions

### 3.1 Selected Stack

- Frontend: `Next.js App Router`
- Language: `TypeScript`
- Styling: `Tailwind CSS`
- Backend service: `Next.js Route Handlers`
- Persistence: `SQLite`
- Authentication: cookie-based server sessions
- Data fetching: simple fetch wrapper first, optional query library later
- State handling: local React state for feature UI, lightweight auth store if needed

### 3.2 Why This Stack

- `Next.js` is the fastest path to a responsive web MVP with clean route structure.
- `TypeScript` helps keep issue and auth data shapes stable.
- `Tailwind CSS` keeps styling fast during a one-week build.
- Route handlers keep the stack small by shipping frontend and backend in one app.
- SQLite gives the app real relational storage without introducing separate infrastructure.

### 3.3 Constraint Note

Although the repository is currently classified as `Starter`, this feature requires authentication and stored issue data. The implementation therefore uses Starter-level UI scope with a minimal built-in backend instead of a purely static site.

## 4. Architecture

### 4.1 High-Level Structure

- Public route group
  - `/login`
- Protected route group
  - `/board`
  - `/dashboard`
- Shared layout
  - top navigation
  - current user summary
  - simple screen switch between board and dashboard

### 4.2 Runtime Flow

1. User opens the service
2. Unauthenticated user is redirected to `/login`
3. After successful login, user lands on `/board`
4. Board fetches issues visible to the current user context
5. User creates an issue or drags an issue to another status
6. Dashboard summarizes delayed issues and issues created by the current user

### 4.3 Data Ownership

- Auth data is stored in SQLite
- Session data is stored in SQLite and linked to an HTTP-only cookie
- Issue records are stored in SQLite
- Delayed status is computed from `dueDate` and `status`

## 5. Page Structure

### 5.1 Login Page

Purpose:
- allow a user to sign in simply

Sections:
- app title and short service description
- login form
- error message area

MVP rules:
- keep to email and password only
- no advanced onboarding flow

### 5.2 Board Page

Purpose:
- main execution screen for issue registration and status updates

Sections:
- top bar with app name, user name, navigation, logout
- quick issue form or modal
- filter row: `All`, `My Issues`, `Delayed`
- status columns:
  - `Todo`
  - `In Progress`
  - `Done`
  - `Discarded`
- reusable issue detail modal triggered from ticket title or detail action

Behavior:
- dragging an issue card to another column updates its status
- cards show title, assignee, due date, delayed badge when needed
- ticket detail opens as an overlay so the user keeps current board position and filter context
- issue detail includes a change history section for status and assignee updates

### 5.3 Dashboard Page

Purpose:
- monitoring screen for team lead and planner workflows

Sections:
- delayed issue summary cards
- delayed issue list
- issues created by me list
- simple completed issue result list
- reusable issue detail modal triggered from each listed issue

Behavior:
- dashboard loads in one screen without nested navigation
- delayed issues are visually separated from normal items
- detail view reuses existing issue data and does not require a dedicated detail route for MVP
- detail view can surface change history without leaving dashboard context

### 5.4 Users Page

Purpose:
- lead-only screen for user management

Sections:
- user list table
- create user form
- role selector
- password reset action

Behavior:
- only `lead` users can access this route
- role updates and password resets happen through admin actions

## 6. Layout and Styling

### 6.1 Layout

- desktop:
  - horizontal header
  - full-width content area
  - three-column board layout
  - centered overlay modal for issue detail
- mobile:
  - stacked header actions
  - horizontally scrollable board columns
  - dashboard cards stacked vertically
  - full-width issue detail sheet with scrollable content

### 6.2 Styling Direction

- clean and high-contrast UI
- limited accent color for actionable items
- clear status colors:
  - Todo: neutral
  - In Progress: active
  - Done: success
  - Discarded: muted
  - Delayed badge: warning or danger

### 6.3 Responsive Breakpoints

- mobile: under `768px`
- tablet and desktop: `768px` and above

## 7. Data Model

### 7.1 User

Fields:
- `id`
- `email`
- `name`
- `role`
- `isActive`
- `createdAt`

Usage:
- login identity
- issue creator reference
- issue assignee reference

### 7.2 Issue

Fields:
- `id`
- `title`
- `description`
- `creatorId`
- `creatorName`
- `assigneeId`
- `assigneeName`
- `status`
- `dueDate`
- `createdAt`
- `updatedAt`

Derived fields:
- `isDelayed = dueDate < now && status !== "Done" && status !== "Discarded"`

The issue detail view reuses these fields directly and does not require an additional detail entity.

### 7.3 Status Enum

- `Todo`
- `In Progress`
- `Done`
- `Discarded`

Status values are fixed in MVP and not user-configurable.

### 7.4 Role Enum

- `lead`
- `member`
- `planner`

### 7.5 Session

Fields:
- `id`
- `userId`
- `createdAt`
- `expiresAt`

## 8. API and Data Access Design

The MVP uses internal API routes under `/api`.

### 8.1 Auth Operations

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### 8.2 Issue Operations

- `GET /api/issues`
  - list all issues for the authenticated user session
- `POST /api/issues`
  - create issue
- `PATCH /api/issues/:id`
  - update status or metadata
- `DELETE /api/issues/:id`
  - discard issue (soft delete) when caller has delete permission
- `GET /api/issues/:id/history`
  - list status and assignee change history with actor and timestamp
  - supports query params: `field`, `days`, `from`, `to`, `page`, `pageSize`

### 8.3 User Operations

- `GET /api/users`
  - list users for lead-only management
- `POST /api/users`
  - create a user
- `PATCH /api/users/:id`
  - update role, active status, or reset password

### 8.4 Client Query Rules

- Board page fetches issues once on load, then updates local UI after successful mutations
- Dashboard page reuses the same issue dataset where possible and loads assignable users for detail edit actions
- Delayed filtering remains client-side for MVP scale
- Detail history query supports field filter and page-based loading

## 9. Component Design

### 9.1 Shared Components

- `AppHeader`
- `NavTabs`
- `StatusBadge`
- `FilterTabs`
- `EmptyState`

### 9.2 Auth Components

- `LoginForm`

### 9.3 Board Components

- `IssueQuickCreate`
- `IssueBoard`
- `IssueColumn`
- `IssueCard`

### 9.4 Dashboard Components

- `DashboardSummaryCards`
- `DelayedIssueList`
- `MyCreatedIssueList`
- `CompletedIssueList`

### 9.5 User Management Components

- `UserManagementPanel`
- `UserTable`
- `CreateUserForm`
- `RoleBadge`

## 10. Interaction Rules

### 10.1 Issue Creation

- required fields: title, assignee, due date
- optional field: description
- default status: `Todo`

### 10.2 Status Change

- drag and drop changes only the `status` field
- on mobile or drag failure, a fallback action button can change status
- `lead` can update any issue
- `member` can update issues they created or are assigned
- `planner` cannot update issue status

### 10.3 Detail-View Follow-up Actions

- detail overlay can update `title`, `description`, `assignee`, `due date`, and `status`
- board and dashboard update local issue state immediately after successful detail save
- discard action is available in detail view only when permission is granted
- `lead` can discard any issue
- `member` can discard only issues they created
- `planner` cannot discard issues

### 10.4 Change History Rules

- history records are created when `status` changes
- history records are created when `assignee` changes
- each record stores actor name, actor role, previous value, next value, and timestamp
- history list is shown in the detail overlay for read-only audit context
- history filter options are `All`, `Status`, and `Assignee`
- history list is paginated with previous and next navigation
- history period options are `All time`, `Last 7 days`, and `Last 30 days`
- field filter and period filter can be combined before pagination
- custom date range filter uses `from` and `to` inputs

### 10.5 Delayed Rule

- an issue is delayed when:
  - due date exists
  - due date is before current time
  - status is not `Done` and not `Discarded`

## 11. Error and Empty State Design

- login failure shows inline error text
- no issues in board shows empty guidance
- no delayed issues shows a positive empty state on dashboard
- issue detail overlay must close by close button or escape key (outside click does not close)
- mutation failure restores previous UI state and shows a small alert

## 12. Security and Access

- unauthenticated access to `/board` and `/dashboard` is blocked
- unauthenticated access to `/users` is blocked
- only authenticated users can create or edit issues
- role-specific authorization rules are enforced in v1
- session cookies must be HTTP-only and scoped to the app
- only `lead` can manage users and assign roles

## 13. Implementation Order

1. Add SQLite database and seed data
2. Add auth API routes and cookie session handling
3. Add issue API routes for list, create, update, and discard
4. Add user management API routes and lead-only authorization
5. Implement login page and auth guard against the API
6. Build board page with status columns
7. Add quick issue creation flow
8. Add drag-and-drop status updates with role checks
9. Build dashboard page
10. Build users page
11. Add reusable issue detail modal and connect board and dashboard actions
12. Add detail-modal follow-up actions for issue edit and discard
13. Add change-history persistence and detail-panel history section
14. Add responsive polishing and fallback state change action

## 14. Test Plan

### 14.1 Functional Checks

- Login succeeds with valid credentials
- Unauthenticated user is redirected to login
- Issue creation works with minimum required fields
- Board displays issues in the correct column
- Drag and drop updates issue status
- Dashboard shows delayed issues correctly
- Dashboard shows issues created by the current user
- Ticket detail opens from board and dashboard and shows the selected issue context
- Detail save updates issue status and metadata
- Detail discard changes issue status to `Discarded` without physical deletion
- Detail history shows who changed status or assignee and when
- Detail history filter and pagination controls return consistent subsets without losing sort order

### 14.2 Responsive Checks

- Board remains usable on mobile widths
- Dashboard cards stack cleanly on mobile
- Navigation remains accessible without overlap

### 14.3 Acceptance Mapping

- Under one minute issue registration:
  - quick form visible on board page
- Single interaction status change:
  - drag and drop or mobile fallback
- One-screen delayed monitoring:
  - delayed section on dashboard
- One-screen personal status check:
  - my created issues section on dashboard
- In-context issue detail review:
  - detail modal opened from ticket title or detail button

## 15. Risks and Design Responses

- SQLite schema migration and seed integrity
  - response: initialize schema automatically and seed only when tables are empty
- drag-and-drop complexity on mobile
  - response: allow fallback status action if drag UX becomes unreliable
- client-side delayed filtering cost
  - response: acceptable for MVP scale, optimize later if issue count grows
- role restrictions confusing users
  - response: expose permission-aware UI states and clear disabled actions

## 16. Learning Points

- Static-looking products can still need backend capability once login is required.
- Derived values such as delayed status are often better computed than stored.
- Reducing status types and page count makes drag-and-drop interfaces much easier to ship.
- Built-in route handlers are often enough for a one-person MVP when external setup time matters.
- SQLite is often the pragmatic first database for a single-node MVP.
- Backend permission rules should be enforced server-side, not only hidden in the UI.

## 17. Changes

- 2026-03-06: Created initial design document for the simple issue management MVP
- 2026-03-06: Updated design to use internal Next.js APIs and persistent server-side storage
- 2026-03-06: Updated design to use SQLite, user management, and role-based authorization
