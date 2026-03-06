# Codex & bkit 으로 만든 tiny issue manager

# Simple Issue Management

## Overview

This repository contains a lightweight issue management MVP built to replace overly complex Jira workflows with a small set of features focused on fast issue registration, easy status changes, delayed issue monitoring, and a clear personal view of submitted issues. The current version uses a built-in Next.js backend with cookie sessions, SQLite persistence, basic user management, and role-based permissions.

## Features

- Fast issue registration targeted for under one minute
- Board-based status tracking with drag-and-drop updates
- In-context issue detail dialog from board and dashboard tickets
- Detail-dialog follow-up actions for issue update and delete
- Detail-dialog change history for status and assignee updates
- Detail-dialog history filter and pagination controls
- Detail-dialog period filters for recent 7 and 30 days
- Detail-dialog custom date range filters (`from` and `to`)
- Delayed issue dashboard on a single screen
- Single-screen view of issues created by the current user
- Login-required responsive web experience
- Lead-only user management
- Role-based permissions for lead, member, and planner

## Stack

- Project level: Starter
- Planned product type: responsive web service
- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: Next.js Route Handlers, cookie sessions, SQLite persistence
- Deployment target: Node-compatible host for the fullstack Next.js app

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Additional checks:

- Type check: `npm run typecheck`
- Production build: `npm run build`

Seeded login accounts:

- `team.lead@example.com`
- `team.member@example.com`
- `team.planner@example.com`
- Default password: `changeme123!` or the value of `SEED_USER_PASSWORD`

## Env Vars

- `SESSION_SECRET`: secret used to sign session cookies
- `SEED_USER_PASSWORD`: default password for seeded accounts in local development
- `DATABASE_URL`: optional SQLite database path override

## Structure

- `README.md`: project overview and current usage status
- `requirement.md`: product requirements and acceptance criteria
- `plan.md`: implementation approach and rollout plan
- `docs/01-plan/features/simple-issue-management.plan.md`: feature-level PDCA plan
- `docs/02-design/features/simple-issue-management.design.md`: feature-level design document
- `docs/03-analysis/simple-issue-management.analysis.md`: design vs implementation gap analysis
- `docs/04-report/simple-issue-management.report.md`: completion report
- `src/app`: Next.js app routes
- `src/components`: board, dashboard, shell, and auth UI
- `src/lib`: auth, issue, and user API clients
- `src/server`: SQLite access, auth, issue, and user management logic
- `src/types`: shared TypeScript models
- `data/app.db`: SQLite database file created on first run
- `docs/.pdca-status.json`: PDCA progress tracking

## Changes

- 2026-03-06: Created initial project overview for the simple issue management planning phase
- 2026-03-06: Recorded planned implementation stack and environment variables during design phase
- 2026-03-06: Updated Quick Start and structure after MVP scaffolding and implementation
- 2026-03-06: Updated overview to reflect the implemented MVP state
- 2026-03-06: Switched backend plan to built-in Next.js API with server persistence
- 2026-03-06: Planned SQLite migration, user management, and role-based authorization
- 2026-03-06: Added in-context issue detail dialog on board and dashboard cards
- 2026-03-06: Added detail-dialog follow-up actions for status update, metadata edit, and issue delete
- 2026-03-06: Added detail-dialog change history for status and assignee updates
- 2026-03-06: Added detail-dialog history filter and pagination controls
- 2026-03-06: Added detail-dialog period filters for 7-day and 30-day history windows
- 2026-03-06: Added detail-dialog custom from/to date-range filters for history
