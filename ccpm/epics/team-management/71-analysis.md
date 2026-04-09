---
issue: 71
title: Frontend Routing
created: 2026-04-10T06:35:00Z
---

# Analysis: Issue #71 - Frontend Routing

## Current State
- `frontend/src/routes.tsx` has routes for `/`, `/login`, `/teams` (ComingSoon), `/players`, `/schedule`, `/games/:id`, etc.
- `/teams` route currently renders `<ComingSoon />`
- No `/teams/:id` route exists

## Changes Needed
1. Add `/teams/:id` route in `frontend/src/routes.tsx` before the catch-all `*` route
2. Import a new `TeamPage` component from `frontend/src/pages/TeamPage.tsx`
3. Create `TeamPage.tsx` as a minimal shell component that accepts `useParams().id`
4. Handle invalid `:id` by navigating to `NotFoundPage` or showing an error

## Files to Create/Modify
- `frontend/src/routes.tsx` (modify)
- `frontend/src/pages/TeamPage.tsx` (new)

## Streams
Single stream - route registration and page shell.
