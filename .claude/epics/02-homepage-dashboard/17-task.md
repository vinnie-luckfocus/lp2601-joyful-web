---
issue: 17
name: "005: 积分榜模块"
status: open
created: 2026-04-08T06:14:45Z
updated: 2026-04-08T06:43:22Z
effort: 12h
parallel: true
depends_on: [13, 14]
---

# 005: 积分榜模块

## Description

开发积分榜表格，含球队排名、金色前三标识

## Acceptance Criteria

1. 表格显示球队名、胜场、负场、胜率、排名
2. 前三名使用金色标识（#C4A35A）
3. 按胜率降序排列
4. 响应式表格（横向滚动移动端）
5. 数据时效提示
6. 空状态处理
7. 无障碍表格（th/scope标识）

## Technical Details

- File: src/components/standings/StandingsTable.tsx
- 使用useStandings hook
- 表格组件支持aria-label
- 排名列特殊样式（金色圆角背景）

## Dependencies

- Issue #13: 基础布局与主题配置
- Issue #14: 公开API接口设计

## Definition of Done

- [ ] 积分榜表格渲染正常
- [ ] 前三名金色标识显示正确
- [ ] 响应式适配正常
- [ ] 无障碍支持完整
