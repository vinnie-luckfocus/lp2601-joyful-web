---
name: 04-game-schedule-test-plan
status: in-progress
created: 2026-04-10T12:30:00Z
updated: 2026-04-10T12:30:00Z
---

# PRD 04 Game Schedule - 测试方案

## 1. 测试目标
验证赛程展示、比赛详情、出席报名等功能的正确性。

## 2. 现状审查

### Backend
- `backend/src/__tests__/routes/games.test.ts`: 21 passed，games 路由覆盖率 63%（主要端点已覆盖）

### Frontend
- `frontend/src/__tests__/components/games/GameCard.test.tsx`: 已覆盖
- `frontend/src/__tests__/components/games/GameGrid.test.tsx`: 已覆盖
- `frontend/src/__tests__/components/games/AttendanceButtons.test.tsx`: 新增，6 passed
- `frontend/src/__tests__/pages/GameSchedulePage.tsx`: **缺失**
- `frontend/src/__tests__/pages/GameDetailPage.tsx`: **缺失**

## 3. 差距
- 需补充 GameSchedulePage 和 GameDetailPage 的组件测试
