---
name: team-management
description: 球队信息展示，包含队名、队徽、简介、成员列表和赛季战绩
created: 2026-04-07T15:01:11Z
status: backlog
---

# PRD: Team Management

## Executive Summary

球队管理模块展示各球队的基本信息和成员列表，增强球队认同感和归属感。每个球队有独立的展示页面，包含队徽、简介、战绩和成员信息。

## Problem Statement

- **问题**：队员对球队信息了解不足，新成员不熟悉队友，缺乏球队荣誉感
- **重要性**：建立球队品牌形象，促进队员之间的了解和团队凝聚力

## User Stories

### 故事1：查看球队信息
**作为** 队员
**我希望** 看到自己球队的基本信息
**从而** 了解球队背景和战绩

**验收标准**：
- [ ] 显示队名、队徽、球队简介
- [ ] 显示联盟级别和赛季战绩
- [ ] 队徽图片清晰显示

### 故事2：查看队友信息
**作为** 队员
**我希望** 看到球队成员列表
**从而** 认识队友，了解他们的位置

**验收标准**：
- [ ] 显示所有成员头像和姓名
- [ ] 显示背号和守备位置
- [ ] 标记队长身份

## Requirements

### Functional Requirements

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 球队信息卡 | 展示队名、队徽、简介、战绩 | P0 |
| 成员列表 | 网格展示成员头像和信息 | P0 |
| 队徽展示 | 支持图片展示和默认占位图 | P0 |
| 战绩统计 | 胜场/负场/胜率计算展示 | P0 |
| 战术入口 | 跳转到战术板的链接 | P1 |
| 最近比赛 | 展示球队最近3场比赛结果 | P1 |

### API Requirements

```
# 球队信息（公开/登录均可）
GET /api/teams/:id
Response: {
  id, name, logo_url, description, division,
  wins, losses, win_rate,
  captain: { id, name, avatar }
}

# 球队成员
GET /api/teams/:id/members
Response: [{
  id, name, jersey_number, position, avatar, role
}]

# 球队最近比赛
GET /api/teams/:id/games?limit=3
Response: [最近比赛结果]
```

### Non-Functional Requirements

| 类型 | 要求 |
| :--- | :--- |
| 图片 | 队徽懒加载，支持WebP格式 |
| 缓存 | 球队信息可缓存10分钟 |
| 响应式 | 成员网格适配不同屏幕尺寸 |

## Success Criteria

| 指标 | 目标值 | 测量方式 |
| :--- | :--- | :--- |
| 页面访问量 | 球队页人均每周1次+ | 埋点统计 |
| 图片加载成功率 | > 98% | 监控告警 |

## Constraints & Assumptions

- 球队信息由管理员录入和修改
- 队员不能自行修改球队信息
- 每个队员只属于一个球队（第一阶段）

## Out of Scope

- 球队信息管理后台（在admin PRD中）
- 球队转让/解散功能
- 成员调动功能
- 球队相册/动态

## Dependencies

- 依赖 teams 数据表
- 依赖 users 数据表
- 依赖 games 数据表（计算战绩）
- 依赖对象存储（队徽图片）
