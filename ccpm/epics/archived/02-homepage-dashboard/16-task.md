---
issue: 16
name: "004: 赛程卡片组件"
status: open
created: 2026-04-08T06:14:45Z
updated: 2026-04-08T06:43:22Z
effort: 12h
parallel: true
depends_on: [13, 14]
---

# 004: 赛程卡片组件

## Description

开发赛程卡片和网格布局，展示未来4场比赛

## Acceptance Criteria

1. GameCard单卡片组件（白色背景、圆角12px、边框#E2E8F0）
2. GameGrid网格布局（3列桌面/1列移动端，gap-6）
3. 显示比赛时间、场地、对阵双方
4. 卡片依次滑入动画（stagger 100ms）
5. 数据时效提示（"5分钟前更新"）
6. "查看更多"跳转链接（未实现页面显示"即将上线"提示）
7. 错误状态显示（使用001的ErrorState组件）
8. 使用001的DataFreshnessIndicator组件显示数据时效

## Technical Details

- Files:
  - src/components/games/GameCard.tsx
  - src/components/games/GameGrid.tsx
  - src/hooks/usePublicGames.ts
- 使用usePublicGames hook获取数据
- Framer Motion StaggerContainer动画（stagger 100ms）
- 空状态组件处理
- 复用001的DataFreshnessIndicator和ErrorState组件
- "查看更多"跳转处理：
  - 检查目标路由是否存在
  - 不存在则显示"即将上线"Tooltip或Modal
  - 或使用disabled样式+提示文字

## Dependencies

- Issue #13: 基础布局与主题配置
- Issue #14: 公开API接口设计

## Definition of Done

- [ ] GameCard组件渲染正常
- [ ] GameGrid响应式布局正确
- [ ] 动画效果流畅
- [ ] 数据时效提示显示正确
- [ ] 错误状态处理完善
