---
name: admin-data-entry
description: 管理后台数据录入功能，包含球队/队员/赛程管理、比赛数据录入、视频上传
created: 2026-04-07T15:01:11Z
status: backlog
---

# PRD: Admin Data Entry

## Executive Summary

管理后台是 Joyful 联赛网站的运营中枢，供管理员完成所有数据维护工作：录入球队和队员信息、创建赛程、录入比赛数据、上传视频。是网站内容的主要入口。

## Problem Statement

- **问题**：网站上线前需要录入大量基础数据，比赛后需要及时录入统计数据和上传视频
- **重要性**：数据质量直接影响队员体验，管理效率决定运营工作量

## User Stories

### 故事1：录入球队和队员
**作为** 管理员
**我希望** 批量导入或手动录入球队和队员信息
**从而** 初始化网站数据

**验收标准**：
- [ ] 支持手动添加球队（队名、队徽、简介）
- [ ] 支持批量导入队员（Excel/CSV）
- [ ] 自动生成分配账号

### 故事2：创建赛程
**作为** 管理员
**我希望** 创建赛季赛程
**从而** 让队员知道比赛安排

**验收标准**：
- [ ] 批量创建多场比赛
- [ ] 设置时间、场地、对阵双方
- [ ] 支持修改和取消

### 故事3：录入比赛数据
**作为** 管理员/队长
**我希望** 赛后快速录入打席数据
**从而** 生成统计数据

**验收标准**：
- [ ] 表格形式快速录入
- [ ] 支持常见结果选择
- [ ] 自动计算统计数据

## Requirements

### Functional Requirements

#### 球队/队员管理

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 球队CRUD | 增删改查球队信息 | P0 |
| 队员CRUD | 增删改查队员信息 | P0 |
| 批量导入 | Excel/CSV导入队员 | P0 |
| 账号生成 | 自动生成初始账号密码 | P0 |
| 队徽上传 | 上传球队Logo | P1 |

#### 赛程管理

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 创建比赛 | 单场/批量创建比赛 | P0 |
| 修改比赛 | 时间、场地调整 | P0 |
| 取消比赛 | 标记比赛取消 | P1 |
| 比赛状态 | 未开始/进行中/已结束 | P0 |

#### 数据录入

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 打席录入 | 表格录入每打席结果 | P0 |
| 快速选择 | 常见结果快捷选择 | P0 |
| 数据修改 | 修改已录入数据 | P1 |
| 录入预览 | 预览后再提交 | P1 |

#### 视频管理

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 视频上传 | 拖拽上传比赛录像 | P0 |
| 精彩时刻 | 标记时间点+描述 | P1 |
| 视频删除 | 删除错误上传 | P1 |

### API Requirements

```
# 球队管理
POST   /api/admin/teams
PUT    /api/admin/teams/:id
DELETE /api/admin/teams/:id

# 队员管理
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/import  # 批量导入

# 赛程管理
POST   /api/admin/games
PUT    /api/admin/games/:id
DELETE /api/admin/games/:id

# 数据录入
POST   /api/admin/games/:id/batting-records
PUT    /api/admin/batting-records/:id

# 视频上传
POST   /api/admin/videos
POST   /api/admin/videos/:id/highlights
```

### Non-Functional Requirements

| 类型 | 要求 |
| :--- | :--- |
| 权限 | 仅管理员角色可访问 |
| 体验 | 批量操作优先，减少重复点击 |
| 校验 | 数据录入有格式校验，防止错误 |
| 日志 | 记录所有修改操作，可追溯 |

## Success Criteria

| 指标 | 目标值 | 测量方式 |
| :--- | :--- | :--- |
| 录入效率 | 单场数据录入 < 10分钟 | 计时测试 |
| 错误率 | 数据录入错误 < 5% | 抽查 |
| 操作满意度 | 管理员反馈"好用" | 问卷 |

## Constraints & Assumptions

- 管理员数量少（1-3人），并发要求低
- 管理员有一定电脑操作能力
- 数据录入时间敏感（赛后尽快完成）

## Out of Scope

- 复杂的权限管理（多角色多层级）
- 数据审批流程
- 操作日志审计界面
- 数据导出报表
- 自动化数据导入（如从其他系统）

## Dependencies

- 依赖所有数据表（teams, users, games, batting_records, videos）
- 依赖对象存储（队徽、视频）
- 依赖用户权限系统
