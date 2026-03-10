# Deployment Guide

## Overview

This document covers the minimum setup required to deploy `tiny-issue-manager` safely in production.

Current deployment assumption: a Node-compatible host with persistent filesystem storage for SQLite. Ephemeral serverless hosting is not suitable unless you replace the current local SQLite storage approach.

## Required Settings

Set these values for every production deployment:

- `SESSION_SECRET`
- `DATABASE_URL` if you do not want to use the default `data/app.db` path

Set these values only for the first production boot of an empty database:

- `BOOTSTRAP_LEAD_EMAIL`
- `BOOTSTRAP_LEAD_NAME`
- `BOOTSTRAP_LEAD_PASSWORD`

Do not enable this in normal production operation:

- `ALLOW_SEED_DATA`

## First Production Deploy

1. Prepare production environment variables.
2. Set `SESSION_SECRET`.
3. Set `DATABASE_URL` if your host requires a custom persistent path.
4. If the database is empty, also set:
   - `BOOTSTRAP_LEAD_EMAIL`
   - `BOOTSTRAP_LEAD_NAME`
   - `BOOTSTRAP_LEAD_PASSWORD`
5. Start the application once.
6. Sign in with the bootstrap lead account.
7. Confirm that the first admin account can access `/users`.
8. Remove the bootstrap lead environment variables after the first successful boot.

## Local Development Notes

- Copy `.env.example` to `.env.local`
- Local demo users are allowed by the local seed flow
- `SEED_USER_PASSWORD` controls the local demo password

## Production Safety Notes

- Keep `SESSION_SECRET` long and random.
- Do not reuse local demo credentials in production.
- Do not leave bootstrap lead values configured after initial setup.
- Do not enable `ALLOW_SEED_DATA` unless you intentionally want demo data in production.

## Example Hosting Setup

Example: generic Node host with persistent disk

- App start command: `npm run build` then `npm run start`
- `NODE_ENV=production`
- `SESSION_SECRET=replace-with-a-long-random-string`
- `DATABASE_URL=/persistent-data/app.db`

First boot only on an empty database:

- `BOOTSTRAP_LEAD_EMAIL=lead@example.com`
- `BOOTSTRAP_LEAD_NAME=Initial Lead`
- `BOOTSTRAP_LEAD_PASSWORD=replace-with-a-strong-password`

After the first successful login:

- Remove `BOOTSTRAP_LEAD_EMAIL`
- Remove `BOOTSTRAP_LEAD_NAME`
- Remove `BOOTSTRAP_LEAD_PASSWORD`

## Verification

After deploy, verify:

- Login works with the intended production admin account
- `/board` loads for authenticated users
- `/users` is accessible to the lead account
- No demo users were created unless explicitly intended

## Related Files

- `README.md`
- `.env.example`
- `src/server/db.ts`
