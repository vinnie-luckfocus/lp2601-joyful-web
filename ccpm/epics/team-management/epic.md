---
name: team-management
status: completed
created: 2026-04-09T22:15:36Z
updated: 2026-04-10T06:45:00Z
progress: 100%
prd: ccpm/prds/05-team-management.md
github: https://github.com/vinnie-luckfocus/lp2601-joyful-web/issues/48
---

# Epic: Team Management

## Overview

球队管理模块展示各球队的基本信息和成员列表，增强球队认同感和归属感。每个球队有独立的展示页面，包含队徽、简介、战绩和成员信息。管理员负责球队信息的录入和维护，队员可查看但不可修改。

## Architecture Decisions

- **REST API**: 复用现有 Express API 模式，新增 3 个只读端点
- **Repository Pattern**: 通过 repository 层封装 teams / users / games 数据访问
- **Image Storage**: 复用现有对象存储服务，队徽 URL 存储于 teams 表
- **Caching**: 球队信息在应用层缓存 10 分钟，减少重复查询
- **Responsive Grid**: 成员列表使用 CSS Grid，桌面 4 列 / 移动端 2 列

## Technical Approach

### Frontend
- 新建 `/teams/:id` 路由和页面组件
- 英雄区使用渐变背景 + 队徽居中布局
- 成员网格使用 Tailwind CSS grid utilities
- 队徽懒加载 + WebP 格式支持
- 动画效果使用 CSS transitions / keyframes（悬停放大、淡入、脉冲）

### Backend
- `GET /api/teams/:id` — 球队基础信息和战绩
- `GET /api/teams/:id/members` — 成员列表
- `GET /api/teams/:id/games?limit=3` — 最近比赛结果
- 战绩通过聚合 games 表实时计算
- 所有端点公开可读（登录即可访问）

### Infrastructure
- 复用现有 PostgreSQL 数据库和对象存储
- 可选：增加 Redis 缓存球队查询结果（10 分钟 TTL）

## Implementation Strategy

1. 数据库：确认/补充 teams 表字段和 seed 数据
2. API：实现 repository + routes + 战绩聚合逻辑
3. 测试：补充 repository 和 API integration tests
4. UI：开发 TeamPage 组件和 MemberGrid 子组件
5. 联调：端到端验证渲染和 API 数据一致性
6. 优化：图片懒加载、缓存、响应式微调

## Task Breakdown Preview

1. **Database Schema & Seeds** — teams 表字段确认，补充示例球队数据
2. **Backend Repository** — TeamRepository 查询与战绩统计逻辑
3. **Backend API Endpoints** — 3 个 GET 端点实现与输入校验
4. **Backend Tests** — repository unit tests + API integration tests
5. **Frontend Routing** — `/teams/:id` 路由注册
6. **Frontend Team Page** — 英雄区、简介、战绩展示
7. **Frontend Member Grid** — 成员卡片、队长标识、响应式布局
8. **Frontend Animations** — 悬停、淡入、脉冲动效
9. **Assets & Lazy Loading** — 队徽 WebP / 懒加载、默认占位图
10. **E2E & Polish** — 端到端测试、缓存联调、UI 细节收尾

## Dependencies

- teams 数据表已存在并可扩展字段
- users 数据表已存在
- games 数据表已存在（用于战绩计算）
- 对象存储已接入（队徽图片上传通道）
- admin 数据录入流程已完成（PRD #01）

## Success Criteria

- 球队页面可正确展示队名、队徽、简介、战绩
- 成员列表显示头像、姓名、背号、位置，队长有金色标识
- 页面访问量埋点可统计，图片加载成功率 > 98%
- 所有新增 API 测试覆盖率 >= 80%
- 页面在桌面和移动端均正常显示

## Tasks Created
- [ ] #67 - team-management-db-schema-seeds (parallel: true)
- [ ] #68 - team-management-backend-repository (parallel: true)
- [ ] #69 - team-management-backend-api-endpoints (parallel: false)
- [ ] #70 - team-management-backend-tests (parallel: false)
- [ ] #71 - team-management-frontend-routing (parallel: true)
- [ ] #72 - team-management-frontend-team-page (parallel: true)
- [ ] #73 - team-management-frontend-member-grid (parallel: false)
- [ ] #74 - team-management-frontend-animations-lazy-loading (parallel: false)
- [ ] #75 - team-management-e2e-polish (parallel: false)

Total tasks: 9
Parallel tasks: 4
Sequential tasks: 5
## Estimated Effort

- 前端开发：2 天
- 后端开发：1.5 天
- 测试与联调：1 天
- **总计：4.5 天（约 1 个迭代周期）**
