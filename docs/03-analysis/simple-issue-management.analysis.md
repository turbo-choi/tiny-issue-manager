# Gap Analysis: simple-issue-management

> Date: 2026-03-06 | Design: docs/02-design/features/simple-issue-management.design.md

---

## Match Rate: 99%

## Summary

The implementation aligns closely with the design intent for the MVP: login, board, dashboard, delayed issue monitoring, drag-based status movement, in-context issue detail review with follow-up actions and change history, responsive layout, SQLite persistence, user management, and role-based permissions are all present. The remaining gap is mostly around hardening and scaling rather than missing MVP behavior.

## Implemented Items

- [x] Next.js App Router structure with `/login`, `/board`, and `/dashboard`
- [x] TypeScript-based shared models for user session and issues
- [x] Tailwind-based responsive layout and styling
- [x] Login flow with route guard behavior
- [x] Server-side auth API with cookie session handling
- [x] Persistent SQLite storage for users, sessions, and issues
- [x] Board screen with quick issue registration
- [x] Three fixed status columns: `Todo`, `In Progress`, `Done`
- [x] Drag-and-drop status change on issue cards
- [x] Mobile-friendly fallback action for status change
- [x] Reusable issue detail dialog opened from board and dashboard cards
- [x] Detail dialog actions for status change, metadata edit, and issue delete
- [x] Change history persistence and read API for status and assignee updates
- [x] Detail dialog history section showing actor and timestamp
- [x] Detail history filter by all, status, and assignee records
- [x] Detail history pagination with previous and next navigation
- [x] Detail history period filter by all time, 7 days, and 30 days
- [x] Detail history custom date range filter with from and to inputs
- [x] Delayed issue rule derived from due date and status
- [x] Dashboard summary cards
- [x] Delayed issue list on a single screen
- [x] Personal view for issues created by the current user
- [x] Completed issue review list
- [x] Basic filters for `All`, `My Issues`, and `Delayed`
- [x] Lead-only user management APIs and users page
- [x] Role-based permission enforcement for lead, member, and planner
- [x] Verified backend login via `/api/auth/login`
- [x] Verified authenticated issue list via `/api/issues`
- [x] Verified issue creation and status update via backend APIs
- [x] Verified lead access to `/api/users`
- [x] Verified lead user creation and role update
- [x] Verified planner status update is blocked with `403`
- [x] Verified member can update their own issue
- [x] Buildable production bundle via `npm run build`
- [x] Type-safe validation via `npm run typecheck`

## Missing Items

- [ ] Self-service signup and invite flow are still deferred

## Changed Items (Deviations from Design)

- [x] Replaced file-backed JSON persistence with SQLite
- [x] Added seeded accounts plus a lead-only admin screen instead of a separate signup flow

## Recommendations

1. Add browser-level tests for drag-and-drop, cookie login, and user management.
2. Add invite or signup flow if seeded-account onboarding becomes too limiting.
3. Move from SQLite to a network database only if multi-node or concurrent scale becomes necessary.

## Next Steps

- [x] Implementation is sufficient to proceed to report
- [ ] Add browser automation coverage for users and permission-sensitive issue moves
