---
name: statistics
description: 比赛数据统计与展示，包含打席记录录入和个人数据统计图表
created: 2026-04-07T15:01:11Z
status: backlog
phase: 1
---

# PRD: Statistics

## Executive Summary

数据统计是 Joyful 联赛的核心价值之一。管理员录入比赛打席数据，系统自动计算统计指标，队员可以查看个人累计数据和趋势分析，量化自己的表现和进步。

## Problem Statement

- **问题**：比赛数据分散在纸上或Excel中，队员看不到自己的累计表现，无法追踪进步
- **重要性**：数据驱动训练，增加比赛趣味性，建立个人成就感

## User Stories

### 故事1：录入比赛数据
**作为** 队长/管理员
**我希望** 方便地录入每场比赛的打席结果
**从而** 生成统计数据

**验收标准**：
- [ ] 表格形式快速录入
- [ ] 支持常见打席结果选择
- [ ] 录入后自动计算统计数据

### 故事2：查看个人数据
**作为** 队员
**我希望** 看到自己的赛季累计数据
**从而** 了解自己的表现

**验收标准**：
- [ ] 显示累计场次、打席、安打、打击率等
- [ ] 显示各项数据的分项统计
- [ ] 数据自动计算更新

### 故事3：查看数据趋势
**作为** 队员
**我希望** 看到自己近期的表现趋势
**从而** 了解自己的状态起伏

**验收标准**：
- [ ] 近5场打击率趋势图
- [ ] 五维能力雷达图
- [ ] 里程碑追踪（如距离100安打还差多少）

## Requirements

### Functional Requirements

#### 数据录入（管理员）

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 打席录入 | 表格录入每打席结果 | P0 |
| 结果选项 | 一垒/二垒/三垒/HR/三振/四坏/出局等 | P0 |
| 批量录入 | 支持一场比赛的连续录入 | P0 |
| 数据修正 | 支持修改已录入数据 | P1 |

#### 数据展示（队员）

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 累计数据 | 总场次、打席、安打、打击率等 | P0 |
| 分项统计 | 1B/2B/3B/HR/打点/得分等 | P0 |
| 趋势图 | 近5场打击率折线图 | P1 |
| 雷达图 | 五维能力图（打击/守备/跑垒/力量/速度） | P1 |
| 里程碑 | 追踪重要数据节点 | P2 |

### API Requirements

```
# 数据录入（管理员）
POST /api/games/:id/batting-records
Headers: Authorization: Bearer {token}
Request: {
  records: [
    { user_id, batting_order, position, pa_result, inning }
  ]
}

# 个人统计数据
GET /api/stats/me
Headers: Authorization: Bearer {token}
Response: {
  user: { name, team, jersey_number, position },
  cumulative: {
    games, at_bats, hits, batting_avg,
    singles, doubles, triples, hr, rbi, runs, walks, strikeouts
  },
  recent_5_games: [{ game_id, batting_avg }],
  milestones: { hits_to_100: 23, projected_date: "2025-06-15" }
}

# 排行榜（公开）
GET /api/public/leaders?category=batting_avg&limit=10
Response: [{ rank, user_id, name, team, value }]
```

### Non-Functional Requirements

| 类型 | 要求 |
| :--- | :--- |
| 准确性 | 统计数据100%准确，自动计算无误差 |
| 性能 | 统计计算 < 1秒 |
| 图表 | 支持响应式图表，动画流畅 |

## Success Criteria

| 指标 | 目标值 | 测量方式 |
| :--- | :--- | :--- |
| 数据录入完整率 | 90%比赛有完整数据 | 后台统计 |
| 数据查看频率 | 人均每周2次+ | 埋点统计 |
| 数据准确性 | 100%无错误 | 抽查验证 |

## Constraints & Assumptions

- 只统计打击数据，暂不统计投球/守备细节
- 打击率计算：安打/打席（不含四坏、牺牲打）
- 数据由管理员统一录入，队员不能自行修改

## Out of Scope

- 投球数据统计
- 守备数据统计
- 高级数据指标（OPS、WAR等）
- 数据导出功能
- 与其他平台数据同步

## Dependencies

- 依赖 batting_records 数据表
- 依赖 games 数据表
- 依赖图表库（Recharts）
- 依赖用户认证系统
