# simple-issue-management - Plan Document

> Version: 1.0.0 | Date: 2026-03-06 | Status: Approved
> Level: Starter

---

## 1. Overview

### 1.1 Purpose

Build a lightweight issue management web service that keeps only the functions needed for daily team work: quick issue registration, easy status updates, delayed issue monitoring, and a simple personal issue view.

### 1.2 Background

The current Jira-based workflow is too complex for the team's real needs. The team wants a simpler tool that reduces friction during issue creation and status tracking while still giving managers and planners enough visibility into delayed work and results.

## 2. User Intent

- Replace complex project management workflows with a small, easy-to-use web service.
- Support three user groups:
  - Team lead: register issues, check status, review results
  - Team member: register issues, change status
  - Planner: register issues, review results
- Deliver core value through:
  - Issue registration within one minute
  - Drag-and-drop status change
  - Single-screen delayed issue monitoring
  - Single-screen personal issue status view

## 3. Alternatives Explored

### 3.1 Board-Centered MVP

- Fastest path to delivery
- Best fit for drag-and-drop status change
- Weaker for delayed issue and results visibility

### 3.2 Dashboard-Centered MVP

- Strong for delayed issue monitoring and review workflows
- Weaker for day-to-day status execution

### 3.3 Dual-Screen MVP (Selected)

- Board screen for issue execution and status updates
- Dashboard screen for delayed issue monitoring and personal tracking
- Best balance across user roles
- Requires strict scope control to fit one week

## 4. YAGNI Review Results

### 4.1 Must Have

- Login
- Issue registration
- Status-column board
- Drag-and-drop status change
- Delayed issue rule
- Delayed issue dashboard
- Personal issue status view
- Basic filters: `All`, `My Issues`, `Delayed`

### 4.2 Nice to Have

- Role-based permission detail
- Search
- Due-date sorting
- Completion note or result memo

### 4.3 Won't Do

- Jira-style workflow customization
- Sprint, epic, or story point features
- Notifications
- File attachments
- Advanced reporting
- Multi-project support
- Mobile app

## 5. Scope Definition

### 5.1 Product Shape

- Responsive web service
- Single team or single project context for MVP

### 5.2 Core Screens

- Board screen
  - Fast issue registration
  - Status-column board view
  - Drag-and-drop status change
  - Filters for all, my issues, and delayed issues
  - Clickable ticket detail view without route change
- Dashboard screen
  - Delayed issue summary and list
  - Personal issue status summary
  - Simple completed result review area
  - Clickable ticket detail view without route change

### 5.3 Minimum Data Model

- Issue title
- Description or memo
- Creator
- Assignee
- Status
- Due date
- Created date
- Updated date

### 5.4 Out of Scope

- Multi-project management
- Fine-grained authorization
- Attachments
- Notifications
- Advanced reports
- Workflow customization

## 6. Requirements

### 6.1 Functional Requirements

- Users must be able to log in.
- Logged-in users must be able to register an issue in under one minute.
- Issues must support title, description, creator, assignee, status, due date, created date, and updated date.
- Users must be able to view issues by status column on the board screen.
- Users must be able to open issue details from the board and dashboard screens without losing their current screen context.
- Users with edit permission must be able to update issue status and metadata from the issue detail view.
- Users with delete permission must be able to discard issues from the issue detail view without physical deletion.
- Users must be able to review status and assignee change history in the detail view, including actor and timestamp.
- Users must be able to filter detail history by all records, status records, and assignee records.
- Users must be able to navigate detail history pages.
- Users must be able to filter detail history by period (`All time`, `Last 7 days`, `Last 30 days`).
- Users must be able to filter detail history by custom `from` and `to` dates.
- Users must be able to change issue status via drag and drop.
- Users must be able to filter issues by `All`, `My Issues`, and `Delayed`.
- The system must identify delayed issues as items whose due date has passed and whose status is not complete.
- Users must be able to view delayed issue status on a single dashboard screen.
- Users must be able to view the status of issues they created on a single screen.
- Team leads and planners must be able to review completed results through a simple summary or list.

### 6.2 Non-Functional Requirements

- The product must be responsive across desktop and mobile web widths.
- Main tasks should be completed within two to three interaction steps where possible.
- The initial release must stay simple enough for first-time users.
- The architecture must stay feasible for one-person development in one week.

## 7. Success Criteria

- A user can create a basic issue within one minute.
- A user can change issue status with a single drag-and-drop interaction.
- A user can identify delayed issues from one dashboard screen.
- A user can review the status of personally created issues from one screen.
- A user can open a ticket detail view from a card title or detail button in one interaction.
- A permitted user can update or discard an issue from the detail view and see board or dashboard data refresh immediately.
- A user can review who changed status or assignee and when from the detail view history section.
- A user can filter history records and navigate pages in the detail history section.
- A user can combine period filter with field filter in detail history.
- A user can apply custom `from/to` dates and combine them with field filters and pagination.
- The team can run daily issue registration, progress tracking, and delay monitoring without needing Jira-level features.

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope growth beyond one week | High | High | Lock the MVP to two screens and must-have features only |
| Drag-and-drop complexity on responsive layouts | Medium | Medium | Keep status columns minimal and allow a click-based fallback if needed |
| Delayed issue definition becomes ambiguous | Medium | Medium | Define delayed as due date passed and not complete |
| Permission requirements grow during implementation | Medium | Medium | Keep MVP focused on login only, defer role detail |
| Solo implementation pressure reduces quality | Medium | High | Keep the data model and UI intentionally small |

## 9. Architecture Considerations

- Use a single responsive web application structure.
- Keep the first release centered on `Login`, `Board`, and `Dashboard`.
- Limit issue status values to a small fixed set such as `Todo`, `In Progress`, `Done`, and `Discarded`.
- Compute delayed issue state from due date and completion state rather than storing a separate field.
- Prioritize implementation in this order:
  1. Login and issue model
  2. Board and issue creation
  3. Drag-and-drop status change
  4. Dashboard for delayed and personal views
  5. Reusable issue detail panel for board and dashboard cards
  6. Detail-panel follow-up actions for issue update and discard
  7. Detail-panel change history section for status and assignee updates
- Prefer implementation simplicity over future extensibility during MVP delivery.

## 10. Schedule

| Phase | Target Date | Status |
|-------|------------|--------|
| Plan | 2026-03-06 | Complete |
| Design | TBD | Pending |
| Implementation | TBD | Pending |
| Review | TBD | Pending |

## 11. References

- `README.md`
- `requirement.md`
- `plan.md`
- `AGENTS.md`

## 12. Changes

- 2026-03-06: Created and approved initial plan for the simple issue management MVP
- 2026-03-06: Added in-context issue detail view scope for board and dashboard cards
- 2026-03-06: Added detail-panel follow-up action scope for update and discard
- 2026-03-06: Added detail-panel change history scope for status and assignee updates
- 2026-03-06: Added detail history filter and pagination scope
- 2026-03-06: Added detail history period filter scope for 7-day and 30-day windows
- 2026-03-06: Added custom from/to history filter scope in detail history
