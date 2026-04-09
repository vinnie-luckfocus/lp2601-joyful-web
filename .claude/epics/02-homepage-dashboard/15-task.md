---
issue: 15
name: "003: Hero英雄区开发"
status: open
created: 2026-04-08T06:14:45Z
updated: 2026-04-08T06:43:22Z
effort: 8h
parallel: true
depends_on: [13]
---

# 003: Hero英雄区开发

## Description

开发Hero英雄区组件，含背景图、MLB风格、淡入动效和登录按钮

## Acceptance Criteria

1. 英雄区高度60vh(桌面)/50vh(移动端)
2. MLB Navy (#041E42)渐变背景
3. 联赛名称和口号白色粗体显示
4. 登录按钮MLB Red (#BF0D3E)配色
5. 文字从下方淡入动画（300ms, ease-out）
6. 底部渐变过渡到内容区

## Technical Details

- File: src/components/hero/HeroSection.tsx
- 使用Framer Motion实现FadeInUp动画
- 背景图懒加载优化
- 响应式文字大小（text-4xl md:text-6xl）

## Dependencies

- Issue #13: 基础布局与主题配置

## Definition of Done

- [ ] 英雄区正确显示高度和背景
- [ ] 文字淡入动画流畅
- [ ] 登录按钮样式正确
- [ ] 响应式适配正常
