---
name: test-plan-all-epics
status: in-progress
created: 2026-04-10T11:43:09Z
updated: 2026-04-10T11:43:09Z
---

# Joyful Baseball League - 全量 PRD 功能测试计划

## 1. 项目概览

| 项目信息 | 内容 |
|---------|------|
| 项目名称 | Joyful Baseball League Web |
| 测试范围 | PRD 01 ~ PRD 08 全部功能 |
| 测试目标 | 确认每个 PRD 的功能已在 main 分支完整实现 |
| 测试负责人 | Claude Code |
| 计划创建时间 | 2026-04-10T11:43:09Z |
| 测试环境 | 本地开发环境（前端 Vite + 后端 Express + PostgreSQL） |

## 2. 测试范围

按顺序依次测试以下 8 个功能 PRD：

| 序号 | PRD 名称 | Epic 目录 | 核心功能 | 优先级 |
|------|---------|-----------|---------|--------|
| 1 | 01-admin-data-entry | `epics/archived/` | 管理后台入口、球队/队员/赛程管理框架 | P0 |
| 2 | 02-homepage-dashboard | `epics/archived/` | 公开首页、积分榜、最近比赛、球员排行榜 | P0 |
| 3 | 03-user-authentication | `epics/archived/` | 用户登录、JWT 认证、首次登录改密、角色权限 | P0 |
| 4 | 04-game-schedule | `epics/04-game-schedule/` | 赛程展示、比赛详情、出席报名 | P0 |
| 5 | 05-team-management | `epics/archived/` | 球队列表/详情、队员展示 | P0 |
| 6 | 06-tactics-board | `epics/archived/` | 战术板、棒次安排、布阵图 | P0 |
| 7 | 07-statistics | `epics/archived/` | 数据统计、打击记录、球员排行榜 | P0 |
| 8 | 08-video-replay | `epics/archived/` | 视频回放、精彩时刻、上传管理 | P0 |

## 3. 测试策略

### 3.1 测试类型

| 测试类型 | 覆盖内容 | 工具/框架 | 目标覆盖率 |
|---------|---------|----------|-----------|
| 单元测试 | 独立函数、工具类、组件行为 | Jest (backend) / Vitest (frontend) | >= 80% |
| 集成测试 | API 端点、数据库交互 | Jest + Supertest | >= 80% |
| E2E 测试 | 关键用户流程 | Playwright | 所有 P0 流程 |
| 手工探索性测试 | UI 交互、边界场景、视觉一致性 | 人工验证 | 每个 PRD |

### 3.2 测试维度

每个 PRD 均需从以下 6 个维度验证：

1. **功能正确性**：需求描述的功能是否已实现并可正常工作
2. **接口契约**：API 请求/响应格式、状态码、错误处理是否符合预期
3. **UI 一致性**：页面渲染、路由、导航、响应式布局是否符合设计
4. **数据完整性**：数据库 Schema、 seed 数据、CRUD 操作是否正确
5. **安全权限**：未认证/无权限用户是否被正确拦截
6. **边界与异常**：非法输入、空状态、网络错误是否被优雅处理

## 4. 标准执行流程（每个 PRD）

针对每个 PRD，严格按照以下 7 个阶段执行：

```
阶段 1: 测试方案设计    → 产出: PRD{NN}-test-plan.md
阶段 2: 测试方案审核    → 产出: 审核记录 + 方案修订
阶段 3: 测试用例编写    → 产出: 新增/补充测试代码
阶段 4: 测试用例执行    → 产出: 测试报告（通过/失败列表）
阶段 5: 缺陷修复        → 产出: 代码修复（仅当阶段 4 有失败时）
阶段 6: 回归验证        → 产出: 回归测试通过确认
阶段 7: 代码提交        → 产出: Git commit 到 main
```

## 5. 逐 PRD 测试跟踪表

### PRD 01: Admin Data Entry

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD01 + 审查现有 admin 代码 | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/01-admin-data-entry-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充 backend 路由测试、frontend 组件测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

### PRD 02: Homepage Dashboard

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD02 + 审查 HomePage 及相关组件 | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/02-homepage-dashboard-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充公开 API 测试、首页组件/Hook 测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

### PRD 03: User Authentication

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD03 + 审查 auth 中间件、路由、store | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/03-user-authentication-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充 auth 集成测试、Login 组件/Hook 测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

### PRD 04: Game Schedule

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD04 + 审查 schedule/game/detail 页面和 API | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/04-game-schedule-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充 games 路由测试、赛程页面组件/Hook 测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

### PRD 05: Team Management

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD05 + 审查 TeamPage、teams API | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/05-team-management-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充 teams 路由测试、TeamPage 组件/Hook 测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

### PRD 06: Tactics Board

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD06 + 审查 TacticsBoardPage、lineup/tactics API | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/06-tactics-board-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充 lineup 路由测试、战术板组件测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

### PRD 07: Statistics

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD07 + 审查 stats dashboard、batting records API | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/07-statistics-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充 stats 路由测试、统计页面组件测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

### PRD 08: Video Replay

| 阶段 | 任务描述 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|---------|------|---------|---------|------|
| 1 | 阅读 PRD08 + 审查 videos API、Video 页面 | pending | - | - | |
| 2 | 设计测试方案并输出到 `ccpm/prds/08-video-replay-test-plan.md` | pending | - | - | |
| 3 | 审核测试方案 | pending | - | - | |
| 4 | 编写/补充 videos 路由测试、视频页面组件测试 | pending | - | - | |
| 5 | 执行测试并记录结果 | pending | - | - | |
| 6 | 缺陷修复（如有） | pending | - | - | |
| 7 | 回归验证 | pending | - | - | |
| 8 | 提交代码 | pending | - | - | |

## 6. 缺陷跟踪表

| 缺陷 ID | 所属 PRD | 问题描述 | 严重程度 | 修复状态 | 对应 Commit |
|--------|---------|---------|---------|---------|-------------|
| - | - | - | - | - | - |

## 7. 总体进度汇总

| PRD | 当前阶段 | 状态 |
|-----|---------|------|
| PRD 01 | 未开始 | pending |
| PRD 02 | 未开始 | pending |
| PRD 03 | 未开始 | pending |
| PRD 04 | 未开始 | pending |
| PRD 05 | 未开始 | pending |
| PRD 06 | 未开始 | pending |
| PRD 07 | 未开始 | pending |
| PRD 08 | 未开始 | pending |

**当前总体完成度**: 0 / 8 PRD

## 8. 执行说明

1. 每次完成一个 PRD 的测试后，更新本文件中的状态、时间和备注。
2. 每个 PRD 的测试计划文档独立保存到 `ccpm/prds/{NN}-{name}-test-plan.md`。
3. 所有代码修改必须通过 `git commit` 提交到 `main` 分支，commit 格式：`test: PRD{NN} - {具体修改内容}`。
4. 任一日志或报告保存到 `ccpm/logs/` 目录下，命名格式：`prd{NN}-test-{timestamp}.md`。
