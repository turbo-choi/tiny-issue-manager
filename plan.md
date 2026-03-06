# Plan

## Goal

Deliver a lightweight issue management MVP that replaces complex Jira workflows with two core screens: a board for execution and a dashboard for monitoring.

## Architecture

- Single responsive web service
- Next.js App Router frontend with TypeScript and Tailwind CSS
- Built-in Next.js route handlers for auth and issue APIs
- Cookie-based session authentication
- SQLite persistence for users, sessions, and issues
- Login-gated access
- Two primary screens:
  - Board: issue creation, board view, drag-and-drop status updates
  - Dashboard: delayed issue overview and creator-focused issue tracking
- Additional admin screen:
  - Users: lead-only user management and role assignment
- Minimal core entities:
  - User
  - Issue
  - Session
- Delayed status derived from due date and completion state instead of stored separately

## Interfaces

- Login screen
- Board screen
- Dashboard screen
- Simple issue registration form or modal
- Reusable issue detail modal opened from board and dashboard cards
- Detail modal actions for status update, issue edit, and issue delete
- Detail modal change history section for status and assignee updates
- Detail modal history filter and pagination controls
- Detail modal period filter controls (7 days and 30 days)
- Detail modal custom date range filter controls (from/to)

## Steps

1. Finalize planning documents and PDCA plan
2. Create design document for screen layout, data model, and auth flow
3. Replace file persistence with SQLite storage and migrate initialization
4. Implement cookie session handling and persistent storage
5. Connect login and issue flows to backend APIs
6. Add user management API and lead-only admin screen
7. Enforce role-based permissions in the backend and UI
8. Implement board and dashboard behavior against the new permissions
9. Add reusable issue detail modal and connect ticket click actions
10. Add issue update and delete API support for detail-modal follow-up actions
11. Connect detail modal actions to board and dashboard state updates
12. Add issue change-history persistence and read API for status and assignee changes
13. Connect detail modal history section to the new API
14. Add history query filter and pagination support to API and detail modal
15. Add history period filter support to API and detail modal
16. Add custom history date-range filter support to API and detail modal
17. Verify success criteria against the MVP scope
18. Document final commands and environment variables

## Tests

- Verify issue registration can be completed within one minute
- Verify drag-and-drop changes issue status correctly
- Verify delayed issue rules are applied correctly
- Verify personal issue view only shows the current user's created issues
- Verify ticket detail view opens from board and dashboard and shows the selected issue context
- Verify detail modal can update status and editable fields for permitted users
- Verify detail modal can delete issues for permitted users and remove them from UI immediately
- Verify detail modal history shows actor and timestamp for status and assignee changes
- Verify detail modal history filter (`All`, `Status`, `Assignee`) works correctly
- Verify detail modal history pagination loads next and previous pages correctly
- Verify detail modal period filter (`All time`, `Last 7 days`, `Last 30 days`) works correctly
- Verify detail modal custom `from/to` period filter works correctly with field filters and pagination
- Verify responsive layout works on desktop and mobile widths

## Rollback

- Remove non-essential features first if schedule slips
- Fall back to click-based status change on smaller screens if drag-and-drop becomes unstable
- Keep authentication and delayed issue rules minimal to protect delivery

## Changes

- 2026-03-06: Created initial implementation plan for the simple issue management MVP
- 2026-03-06: Updated architecture to a concrete Next.js plus bkend.ai design choice
- 2026-03-06: Added demo-mode fallback to support local development and verification
- 2026-03-06: Changed backend approach to internal Next.js APIs with persistent server storage
- 2026-03-06: Planned SQLite migration plus user management and RBAC
- 2026-03-06: Added reusable issue detail modal step for board and dashboard cards
- 2026-03-06: Added detail modal follow-up action implementation for update and delete
- 2026-03-06: Added change-history implementation step for status and assignee changes
- 2026-03-06: Added change-history filter and pagination implementation step
- 2026-03-06: Added change-history period filter implementation step
- 2026-03-06: Added custom history date-range filter implementation step
