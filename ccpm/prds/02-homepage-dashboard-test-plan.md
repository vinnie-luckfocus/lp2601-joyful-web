---
name: 02-homepage-dashboard-test-plan
status: completed
created: 2026-04-10T12:20:00Z
updated: 2026-04-10T12:20:00Z
---

# PRD 02 Homepage Dashboard - 测试方案

## 1. 测试目标

验证公开首页及仪表盘的完整功能，包括球队积分榜、最近比赛、球员排行榜等公开 API 和页面组件。

## 2. 现状审查结果

### 2.1 Backend

| 功能 | 文件路径 | 状态 |
|------|---------|------|
| 公开 API | `backend/src/routes/public.ts` | 已测试，覆盖率 98.36% |
| 公开数据服务 | `backend/src/services/publicApi.ts` | 已测试，覆盖率 100% |

### 2.2 Frontend

| 功能 | 文件路径 | 状态 |
|------|---------|------|
| HomePage | `frontend/src/pages/HomePage.tsx` | 已测试，覆盖率 91.66% |
| GameCard | `frontend/src/components/games/GameCard.tsx` | 已测试 |
| GameGrid | `frontend/src/components/games/GameGrid.tsx` | 已测试 |
| Leaderboard | `frontend/src/components/leaders/Leaderboard.tsx` | 已测试 |
| StandingsTable | `frontend/src/components/StandingsTable.tsx` | 已测试 |
| usePublicGames | `frontend/src/hooks/usePublicGames.ts` | 已测试，覆盖率 100% |
| useLeaders | `frontend/src/hooks/useLeaders.ts` | 已测试，覆盖率 100% |

## 3. 测试用例设计

### Backend 集成测试

#### `backend/src/__tests__/routes/public.test.ts`
- [x] `GET /api/standings` - 返回积分榜
- [x] `GET /api/recent-games` - 返回最近比赛
- [x] `GET /api/leaders` - 返回球员排行榜
- [x] 错误处理和异常分支

#### `backend/src/__tests__/services/publicApi.test.ts`
- [x] 公开数据查询逻辑覆盖

### Frontend 组件/Hook 测试

#### `frontend/src/__tests__/components/HomePage.test.tsx`
- [x] 渲染导航栏
- [x] 渲染 HeroSection
- [x] 渲染统计数据

#### `frontend/src/__tests__/components/games/GameCard.test.tsx`
- [x] 渲染比赛卡片信息
- [x] 点击跳转比赛详情

#### `frontend/src/__tests__/components/games/GameGrid.test.tsx`
- [x] 渲染比赛网格
- [x] 空数据状态

#### `frontend/src/__tests__/components/leaders/Leaderboard.test.tsx`
- [x] 渲染排行榜列表
- [x] 排序切换

#### `frontend/src/__tests__/hooks/usePublicGames.test.ts`
- [x] 获取公开比赛数据
- [x] 缓存和错误处理

## 4. 覆盖率结果

- backend public routes: 98.36%
- backend publicApi service: 100%
- frontend HomePage: 91.66%
- frontend usePublicGames: 100%
- frontend useLeaders: 100%

## 5. 缺陷跟踪

| 缺陷 ID | 问题描述 | 修复状态 |
|--------|---------|---------|
| - | 无明显缺陷 | - |

## 6. 结论

PRD 02 首页仪表盘相关功能测试完善，覆盖率达到项目要求，无需额外修复。
