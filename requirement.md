# Requirement

## Functional Requirements

- Users must be able to log in before using the service.
- Logged-in sessions must be preserved by the server so page refresh does not lose authentication state.
- Team leads must be able to view, create, and update user accounts.
- Team leads must be able to assign user roles.
- The system must enforce role-based permissions for `lead`, `member`, and `planner`.
- Users must be able to register an issue within one minute using a simple form.
- Users must be able to choose the assignee from an active user dropdown instead of free-text entry.
- Each issue must include title, description or note, creator, assignee, status, due date, created date, and updated date.
- Users must be able to view issues in a board grouped by status.
- Users must be able to open an issue detail view from the board or dashboard without leaving the current workflow.
- Users must be able to change issue status directly inside the issue detail view.
- Users with edit permission must be able to update issue title, description, assignee, and due date inside the issue detail view.
- Users with delete permission must be able to delete an issue inside the issue detail view.
- Users must be able to view issue change history in the detail view for status and assignee changes.
- Each history record must include who changed the issue and when the change happened.
- Users must be able to filter issue history by `All`, `Status`, and `Assignee` in the detail view.
- Users must be able to navigate issue history using pagination in the detail view.
- Users must be able to filter issue history by period (`All time`, `Last 7 days`, `Last 30 days`) in the detail view.
- Users must be able to filter issue history by a custom date range (`from` and `to`) in the detail view.
- Users must be able to change issue status by drag and drop.
- Users must be able to filter issues by `All`, `My Issues`, and `Delayed`.
- The system must mark an issue as delayed when its due date has passed and its status is not complete.
- Users must be able to view delayed issue status on a single dashboard screen.
- Users must be able to view the status of issues they created on a single screen.
- Team leads and planners must be able to review completed results from a simple summary or list.
- Team members must only be allowed to change issue status for issues they created or are assigned.
- Planners must not be allowed to change issue status.

## Non-Functional Requirements

- The service must be delivered as a responsive web application.
- The backend must persist users, sessions, and issues outside the browser so data survives refresh and logout.
- The backend must persist users, sessions, and issues in SQLite so data survives process restarts.
- Core actions should be reachable within two to three steps.
- The interface must stay simple enough for first-time users to understand without training.
- The initial release must stay within a one-week solo implementation scope.
- The first version must prefer simplicity and stability over extensibility.

## Scope

### In Scope

- Login
- Issue registration
- Board screen with status columns
- Drag-and-drop status change
- Delayed issue dashboard
- Personal issue view
- Basic filters
- User management
- Role assignment

### Out of Scope

- Jira-style workflow customization
- Sprint, epic, story point, and similar planning features
- Notifications
- File attachments
- Advanced analytics or reports
- Multi-project management
- Mobile app
- Self-service signup flow

## Constraints

- Delivery target: one week
- Team size: one developer
- Platform: responsive web only
- Login is mandatory for MVP

## Acceptance

- A user can create a basic issue in under one minute.
- A user can move an issue to another status with a single drag-and-drop action.
- A user can open one dashboard screen and identify delayed issues immediately.
- A user can open one screen and review the status of issues they created.
- A user can open issue details from a ticket card title or detail action and review full context in one place.
- A permitted user can update issue status and details from the issue detail view and see the board or dashboard reflect changes immediately.
- A permitted user can delete an issue from the issue detail view and see it removed immediately from board and dashboard lists.
- A user can open the detail view and check status or assignee change records with actor and timestamp.
- A user can filter history to status-only or assignee-only records and move between pages.
- A user can filter history by period (`Last 7 days`, `Last 30 days`) and combine it with field filters.
- A user can set custom `from/to` dates for issue history and combine them with field filters and pagination.

## Risks

- Scope may expand beyond one week if secondary features are added.
- Drag-and-drop behavior may take more time than expected on smaller screens.
- Delayed issue rules may become unclear if the completion definition changes.
- SQLite schema migration may break seeded account or issue compatibility if handled poorly.

## Changes

- 2026-03-06: Added initial MVP requirements for the simple issue management service
- 2026-03-06: Added server-side session and persistence requirements for the real backend
- 2026-03-06: Added SQLite persistence, user management, and RBAC requirements
- 2026-03-06: Added issue detail view requirement for board and dashboard tickets
- 2026-03-06: Added detail-view follow-up actions for status change, issue edit, and issue delete
- 2026-03-06: Added issue change history requirement for status and assignee updates
- 2026-03-06: Added issue history filter and pagination requirements
- 2026-03-06: Added issue history period filter requirements (7 days and 30 days)
- 2026-03-06: Added custom from/to history period filter requirements
