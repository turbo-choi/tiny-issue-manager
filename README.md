# Codex & bkit 으로 만든 tiny issue manager

# Simple Issue Management

## Overview

This repository contains a lightweight issue management MVP built to replace overly complex Jira workflows with a small set of features focused on fast issue registration, easy status changes, delayed issue monitoring, and a clear personal view of submitted issues. The current version uses a built-in Next.js backend with cookie sessions, SQLite persistence, basic user management, and role-based permissions.

## Features

- Fast issue registration targeted for under one minute
- Board-based status tracking with drag-and-drop updates
- In-context issue detail dialog from board and dashboard tickets
- Detail-dialog follow-up actions for issue update and discard (soft delete)
- Detail-dialog change history for status and assignee updates
- Detail-dialog history filter and pagination controls
- Detail-dialog period filters for recent 7 and 30 days
- Detail-dialog custom date range filters (`from` and `to`)
- Detail-dialog outside click does not close; only `Close` or `Esc` closes it
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
- Hosting note: the current SQLite setup assumes persistent filesystem storage and is not a fit for ephemeral serverless hosting without changing persistence

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use `.env.local` for local overrides. For production, copy the same keys into your deployment environment and do not keep demo defaults.

Additional checks:

- Type check: `npm run typecheck`
- Production build: `npm run build`

## Local vs Production

| Topic | Local development | Production deployment |
|-------|-------------------|-----------------------|
| Session secret | Set in `.env.local` | Set in deployment env |
| Database path | Can use default `data/app.db` | Set `DATABASE_URL` if you need a different persistent path |
| Demo users | Allowed by local seed flow | Disabled unless `ALLOW_SEED_DATA=true` |
| First admin | Optional seeded lead account | Use bootstrap lead env vars on the first boot of an empty DB |
| Env file usage | Copy `.env.example` to `.env.local` | Apply the same keys in your hosting/platform env settings |

Local seeded login accounts:

- `team.lead@example.com`
- `team.member@example.com`
- `team.planner@example.com`
- Default password: `changeme123!` or the value of `SEED_USER_PASSWORD`

Production first admin bootstrap:

- Set `BOOTSTRAP_LEAD_EMAIL`
- Set `BOOTSTRAP_LEAD_NAME`
- Set `BOOTSTRAP_LEAD_PASSWORD`
- Start the app once against an empty database
- The app creates a single `lead` user and does not create demo users unless `ALLOW_SEED_DATA=true`

## Env Vars

- `SESSION_SECRET` [`production`, `local`]: secret used to sign session cookies
- `DATABASE_URL` [`production`, `local`]: optional SQLite database path override
- `BOOTSTRAP_LEAD_EMAIL` [`first boot only`]: one-time initial lead email for an empty production database
- `BOOTSTRAP_LEAD_NAME` [`first boot only`]: one-time initial lead display name for an empty production database
- `BOOTSTRAP_LEAD_PASSWORD` [`first boot only`]: one-time initial lead password for an empty production database
- `SEED_USER_PASSWORD` [`local`]: default password for seeded accounts in local development
- `ALLOW_SEED_DATA` [`avoid in production`]: optional production override to allow demo seed data

## Production Deployment Checklist

Must be set for every production deployment:

- `SESSION_SECRET`
- `DATABASE_URL` if you do not want to use the default `data/app.db` path

Must be set for the first production boot on an empty database:

- `BOOTSTRAP_LEAD_EMAIL`
- `BOOTSTRAP_LEAD_NAME`
- `BOOTSTRAP_LEAD_PASSWORD`

Should not be enabled in normal production operation:

- `ALLOW_SEED_DATA`

## First Production Deploy

1. Set `SESSION_SECRET` and your production `DATABASE_URL`.
2. If the database is empty, also set `BOOTSTRAP_LEAD_EMAIL`, `BOOTSTRAP_LEAD_NAME`, and `BOOTSTRAP_LEAD_PASSWORD`.
3. Start the app once and sign in with the bootstrap lead account.
4. After the first successful boot, remove the bootstrap lead env vars and keep only the normal production settings.

For the full production procedure, see `DEPLOYMENT.md`.

## Structure

- `README.md`: project overview and current usage status
- `DEPLOYMENT.md`: production deployment and first-boot setup guide
- `requirement.md`: product requirements and acceptance criteria
- `plan.md`: implementation approach and rollout plan
- `docs/01-plan/features/simple-issue-management.plan.md`: feature-level PDCA plan
- `docs/02-design/features/simple-issue-management.design.md`: feature-level design document
- `docs/03-analysis/simple-issue-management.analysis.md`: design vs implementation gap analysis
- `docs/04-report/simple-issue-management.report.md`: completion report
- `docs/05-architecture/simple-issue-management-flow.md`: runtime process flow diagrams
- `docs/05-architecture/simple-issue-management-database.md`: SQLite database and ER diagrams
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
- 2026-03-06: Added detail-dialog follow-up actions for status update, metadata edit, and issue discard
- 2026-03-06: Added detail-dialog change history for status and assignee updates
- 2026-03-06: Added detail-dialog history filter and pagination controls
- 2026-03-06: Added detail-dialog period filters for 7-day and 30-day history windows
- 2026-03-06: Added detail-dialog custom from/to date-range filters for history
- 2026-03-06: Updated detail-dialog close behavior to ignore outside-click close
- 2026-03-10: Documented production env requirements, first-deploy bootstrap flow, and local-vs-production setup guidance
- 2026-03-10: Added a dedicated `DEPLOYMENT.md` guide for production rollout and first-boot setup
