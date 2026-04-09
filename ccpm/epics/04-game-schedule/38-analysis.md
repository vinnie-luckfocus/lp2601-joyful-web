---
issue: 38
title: Register new backend routes in app router
analyzed: 2026-04-09T13:02:00Z
estimated_hours: 1
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #38

## Overview

The games routes are already registered in `backend/src/routes/index.ts` (done as part of Issues #36 and #37). This task is to verify the wiring and add smoke tests ensuring all 5 new endpoints respond with expected HTTP status codes.

## Parallel Streams

### Stream A: Route Registration Verification & Smoke Tests
**Scope**: Verify routes are wired, add smoke tests to app.test.ts
**Files**:
- `tests/backend/app.test.ts`
**Agent Type**: backend-specialist
**Can Start**: immediately
**Estimated Hours**: 1
**Dependencies**: none

## Coordination Points

### Shared Files
- `tests/backend/app.test.ts` — append smoke tests

## Conflict Risk Assessment
- **Low Risk**: only appending tests

## Parallelization Strategy

**Recommended Approach**: sequential (single stream)

## Expected Timeline

- Wall time: 1 hour
- Total work: 1 hour
