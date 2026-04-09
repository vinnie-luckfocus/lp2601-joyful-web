---
issue: 44
title: Add React Router routes for schedule pages
analyzed: 2026-04-09T13:15:00Z
estimated_hours: 1
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #44

## Overview

The `/schedule` and `/games/:id` routes are already registered in `frontend/src/routes.tsx` by Issues #39 and #40. This task is to ensure `GameDetailPage` handles invalid `:id` parameters gracefully with a friendly not-found state, and to add a project-wide 404/not-found route if absent.

## Parallel Streams

### Stream A: Route Validation & 404 Page
**Scope**: Update `GameDetailPage` for invalid id handling, add/update `NotFoundPage`, register catch-all in `routes.tsx`
**Files**:
- `frontend/src/pages/GameDetailPage.tsx`
- `frontend/src/routes.tsx`
- `frontend/src/pages/NotFoundPage.tsx` (new or update)
**Agent Type**: frontend-specialist
**Can Start**: immediately
**Estimated Hours**: 1
**Dependencies**: none

## Coordination Points

### Shared Files
- `frontend/src/routes.tsx` — add catch-all 404 route

## Conflict Risk Assessment
- **Low Risk**: very small change

## Parallelization Strategy

**Recommended Approach**: sequential (single stream)

## Expected Timeline

- Wall time: 1 hour
- Total work: 1 hour
