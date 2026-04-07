---
name: tactics-board
description: 战术板展示，包含棒次安排、守备位置、战术说明和可视化布阵图
created: 2026-04-07T15:01:11Z
status: backlog
phase: 1
---

# PRD: Tactics Board

## Executive Summary

战术板是比赛前最重要的准备工具，展示教练安排的棒次顺序、守备位置和战术要点。通过可视化的布阵图，让队员清楚了解自己的职责。

## Problem Statement

- **问题**：战术安排通常口头传达，容易遗漏或记错；新队员不清楚守备位置
- **重要性**：确保比赛时每个人都知道自己的棒次和位置，提高配合效率

## User Stories

### 故事1：查看棒次安排
**作为** 队员
**我希望** 看到下场比赛的棒次顺序
**从而** 知道自己第几个打

**验收标准**：
- [ ] 显示1-9棒的打击顺序
- [ ] 每棒显示姓名和背号
- [ ] 突出显示"我"的位置

### 故事2：查看守备位置
**作为** 队员
**我希望** 看到全场守备布阵
**从而** 知道自己守哪个位置

**验收标准**：
- [ ] 可视化棒球场示意图
- [ ] 标记每个位置的队员
- [ ] 点击位置显示队员信息

### 故事3：查看战术说明
**作为** 队员
**我希望** 看到教练的战术布置
**从而** 执行统一的战术策略

**验收标准**：
- [ ] 显示文字形式的战术要点
- [ ] 支持暗号表查看
- [ ] 支持防守策略说明

## Requirements

### Functional Requirements

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 棒次列表 | 1-9棒打击顺序展示 | P0 |
| 位置标记 | 每棒对应的守备位置 | P0 |
| 布阵图 | 可视化棒球场位置图 | P0 |
| 战术说明 | 文字形式的战术要点 | P0 |
| 暗号表 | 战术暗号对照表 | P1 |
| 我的高亮 | 突出显示当前用户 | P0 |
| 历史战术 | 查看过往比赛战术 | P2 |

### API Requirements

```
GET /api/games/:id/lineup
Headers: Authorization: Bearer {token}
Response: {
  game_id,
  lineup: [
    { batting_order: 1, user_id, name, position, jersey_number }
  ],
  tactics: {
    general_notes: "对左投策略...",
    signals: { ... },
    defense_strategy: "双杀优先..."
  }
}
```

### Non-Functional Requirements

| 类型 | 要求 |
| :--- | :--- |
| 可视化 | 布阵图清晰易懂，位置标记明确 |
| 响应式 | 移动端上下布局，桌面端左右布局 |
| 动效 | 位置点加载动画，点击反馈 |

## Success Criteria

| 指标 | 目标值 | 测量方式 |
| :--- | :--- | :--- |
| 战术查看率 | 90%队员赛前查看 | 埋点统计 |
| 理解度 | 队员反馈"清楚自己的位置" | 问卷 |

## Constraints & Assumptions

- 战术由队长/管理员录入
- 每场比赛只有一个战术安排
- 假设标准棒球场布局（9人制）

## Out of Scope

- 战术编辑器（在admin PRD中）
- 实时战术调整推送
- 动画演示战术执行
- 对方球队情报分析

## Dependencies

- 依赖 games 数据表
- 依赖 users 数据表
- 需要自定义布阵图组件（SVG/Canvas）
