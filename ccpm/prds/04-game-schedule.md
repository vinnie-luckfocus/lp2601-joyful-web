---
name: game-schedule
description: 赛程管理系统，包含完整赛程展示、比赛报名、报名人数统计
created: 2026-04-07T15:01:11Z
status: backlog
phase: 1
---

# PRD: Game Schedule

## Executive Summary

赛程管理是联赛运转的核心功能。公开展示所有比赛安排，登录后支持队员报名参赛，实时统计报名人数，帮助队长了解人员情况。

## Problem Statement

- **问题**：队员不清楚比赛安排，报名过程混乱（微信群接龙），队长不知道能来几个人
- **重要性**：确保比赛能正常进行，提前知道人数便于安排阵容

## User Stories

### 故事1：查看完整赛程
**作为** 队员
**我希望** 看到本赛季所有比赛的时间、场地、对手
**从而** 提前安排个人时间

**验收标准**：
- [ ] 按时间顺序展示所有比赛
- [ ] 显示时间、场地、对阵双方
- [ ] 支持按月份筛选

### 故事2：报名参赛
**作为** 队员
**我希望** 一键报名参加某场比赛
**从而** 让队长知道我能来

**验收标准**：
- [ ] 能点击"参加"报名
- [ ] 能点击"不参加"取消
- [ ] 状态实时更新
- [ ] 有视觉反馈（动画/提示）

### 故事3：查看报名情况
**作为** 队员或队长
**我希望** 看到谁报名了这场比赛
**从而** 了解人员情况

**验收标准**：
- [ ] 显示已报名人数
- [ ] 显示已报名队员名单（头像+姓名）
- [ ] 区分"已确认"和"未回复"

## Requirements

### Functional Requirements

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 赛程列表 | 时间线/日历视图展示比赛 | P0 |
| 比赛详情 | 单场比赛的完整信息页 | P0 |
| 报名按钮 | 参加/不参加/取消按钮 | P0 |
| 报名名单 | 展示已报名队员列表 | P0 |
| 人数统计 | 显示已报名人数 | P0 |
| 我的报名 | 标记我参加的比赛 | P1 |
| 日期筛选 | 按月份查看赛程 | P1 |

### API Requirements

```
# 公开接口（首页用）
GET /api/public/games?limit=10
Response: [{ id, scheduled_at, location, home_team, away_team, status }]

# 需要登录
GET /api/games
Headers: Authorization: Bearer {token}
Response: [完整比赛信息 + 我的报名状态]

GET /api/games/:id
Response: { 比赛详情, attendance_list, my_status }

POST /api/games/:id/attend
Request: { status: 'confirmed' | 'declined' }
Response: { success: true, updated_list }

GET /api/games/:id/attendance
Response: { confirmed: [...], declined: [...], pending: [...] }
```

### Non-Functional Requirements

| 类型 | 要求 |
| :--- | :--- |
| 实时性 | 报名后名单实时更新 |
| 并发 | 支持10人同时报名无冲突 |
| 性能 | 列表页加载 < 1秒 |

### UI/UX Design (MLB Style)

**色彩方案**:
| 元素 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#F5F7FA` | 浅灰蓝背景 |
| 比赛卡片 | `#FFFFFF` | 白色卡片背景 |
| 状态-未开始 | `#041E42` (MLB Navy) | 边框或标签 |
| 状态-进行中 | `#2D8659` (Success Green) | 实时标签 |
| 状态-已结束 | `#A0AEC0` (Gray) | 灰色调 |
| 我参加的比赛 | `#BF0D3E` (MLB Red) | 左边框高亮 4px |
| 报名按钮 | `#BF0D3E` → `#A00B34` | 红色填充，悬停加深 |
| 已报名状态 | `#2D8659` | 绿色勾选图标 |

**布局规范**:
- 顶部：月份切换器，居中显示，左右箭头
- 比赛卡片：时间轴布局，左侧时间，右侧卡片
- 报名区域：卡片底部，显示人数 + 报名按钮
- 已报名名单：头像横向排列，最多显示5个，+N 表示更多

**动效规范**:
- 月份切换：卡片交错滑入（stagger 50ms）
- 报名按钮点击：缩放反馈（scale 0.95 → 1）+ 颜色变化
- 报名成功：勾选图标弹出 + 轻微震动
- 骨架屏：卡片加载时使用 MLB Navy 色调骨架

## Success Criteria

| 指标 | 目标值 | 测量方式 |
| :--- | :--- | :--- |
| 报名完成率 | 80%比赛提前3天报满9人 | 数据统计 |
| 报名操作成功率 | > 99% | 日志统计 |

## Constraints & Assumptions

- 每人每场比赛只能选择一个状态
- 不限制报名人数上限（实际由队长控制）
- 报名截止时间默认为比赛开始前2小时

## Out of Scope

- 自动提醒功能（在微信通知PRD中）
- 候补名单功能
- 请假审批流程
- 报名与出勤挂钩统计

## Dependencies

- 依赖 games 数据表
- 依赖 game_attendance 关联表
- 依赖用户认证系统
