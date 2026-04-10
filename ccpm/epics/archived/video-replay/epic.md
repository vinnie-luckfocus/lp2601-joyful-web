---
name: video-replay
status: completed
created: 2026-04-09T22:15:43Z
updated: 2026-04-10T10:01:05Z
progress: 100%
prd: ccpm/prds/08-video-replay.md
github: https://github.com/vinnie-luckfocus/lp2601-joyful-web/issues/60
---

# Epic: Video Replay

## Overview

Implement a video replay system that allows administrators to upload game recordings and team members to review them later. The system supports highlight markers (精彩时刻) for quick navigation to key moments, making post-game analysis more effective and professional.

Key goals:
- Enable drag-and-drop video uploads with progress feedback
- Provide smooth 720p playback with standard controls
- Support highlight timeline with time-stamped descriptions
- Store videos in object storage (OSS/COS) with CDN delivery

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Direct-to-OSS presigned upload | Offloads large file transfers from the API server; supports resumable uploads |
| H.264/MP4 as canonical format | Broad browser compatibility; hardware decoding on most devices |
| PostgreSQL for metadata + highlights | Existing tech stack; video metadata and highlight records are relational |
| Native HTML5 `<video>` player | No heavy external dependency; sufficient for playback/seek/speed controls |
| Thumbnail generated on upload | Consistent cover images without manual work per video |

## Technical Approach

### Frontend
- Build a video list page with a hero card (latest game) + grid of historical videos
- Implement a dedicated playback page with the HTML5 video player and a highlight timeline sidebar
- Add a drag-and-drop upload modal/drawer with progress feedback
- Use Framer Motion for play-button expand, video transitions, and blur-up cover loading

### Backend
- Create REST endpoints for video CRUD and highlights (`/api/videos`, `/api/videos/:id/highlights`)
- Implement presigned URL generation for direct client-to-OSS uploads
- Add a lightweight upload completion webhook to persist metadata and trigger thumbnail extraction
- Add admin-only authorization for upload/delete operations

### Infrastructure
- Configure object storage bucket (OSS/COS) with public read policy for video delivery
- Set up CDN domain in front of the bucket for global acceleration
- Add CORS rules on the bucket to allow frontend origin

## Implementation Strategy

1. Design and migrate the database schema (`videos` and `video_highlights`)
2. Implement backend APIs (list, detail, upload-init, complete, highlights)
3. Build frontend video list and playback pages
4. Integrate object storage SDK and presigned upload flow
5. Add highlight creation and timeline UI
6. Write tests and verify upload/playback end-to-end

## Task Breakdown Preview

1. **Database Schema** — Create `videos` and `video_highlights` tables with Prisma migrations
2. **Backend APIs** — Implement video CRUD, upload presign, and highlight endpoints
3. **Frontend Pages** — Video list page (hero + grid) and video playback page
4. **Upload Integration** — Drag-and-drop uploader with progress and direct-to-OSS flow
5. **Highlight Timeline** — Create, list, and click-to-seek highlights on the playback page
6. **Thumbnail & Cover** — Auto-generate thumbnail on upload completion; blur-up lazy loading
7. **Admin Authorization** — Restrict upload and delete to admin role only
8. **Object Storage Setup** — Bucket, CORS, CDN, and environment configuration
9. **Tests & QA** — Unit, integration, and E2E tests for upload and playback flows
10. **Polish & Release** — Animations, error handling, accessibility, and performance tuning

## Dependencies

- Object storage service account (OSS/COS) and CDN domain
- `games` data and API already in place for linking recordings to matches
- Prisma ORM and PostgreSQL (already part of the tech stack)

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Upload success rate | > 95% | Server logs |
| Playback smoothness | > 98% no stutter | User feedback + synthetic tests |
| Game video coverage | 80% of games have a recording | Database query |

## Tasks Created

| Task | Name | Parallel |
| :--- | :--- | :--- |
| 61 | Database schema and migrations for videos and highlights | true |
| 62 | Backend video list and detail endpoints | false |
| 63 | Backend upload initialization and completion endpoints | true |
| 64 | Backend highlight CRUD endpoints | true |
| 65 | Frontend video list page | false |
| 66 | Frontend video playback page | false |

Total tasks: 6
Parallel tasks: 3
Sequential tasks: 3

## Estimated Effort

2–3 developer sprints (approximately 4–6 weeks) for a single full-stack engineer, assuming object storage credentials and domain provisioning are ready.
