---
issue: 13
name: "001: 基础布局与主题配置"
status: open
created: 2026-04-08T06:14:45Z
updated: 2026-04-08T06:43:22Z
effort: 8h
parallel: true
depends_on: []
---

# 001: 基础布局与主题配置

## Description

配置Tailwind MLB色彩主题、响应式断点，创建页面基础布局和路由结构

## Acceptance Criteria

1. Tailwind配置扩展MLB色彩（navy: #041E42, red: #BF0D3E, gold: #C4A35A, blue: #3182CE）
2. 响应式断点配置（sm:640px, md:768px, lg:1024px, xl:1280px）
3. 创建HomePage页面组件和/路由
4. 创建基础布局组件（Navbar, Footer占位）
5. 创建通用Skeleton组件
6. 创建通用数据时效提示组件（DataFreshnessIndicator）
7. 创建通用错误状态组件（ErrorState）
8. 创建通用按钮组件（Button，内置悬停动效 translateY -2px + 阴影加深）

## Technical Details

- Files:
  - tailwind.config.js (MLB色彩配置)
  - src/pages/HomePage.tsx
  - src/components/layout/Navbar.tsx (含登录按钮，MLB Red配色)
  - src/components/layout/Footer.tsx (MLB Navy背景)
  - src/components/common/Skeleton.tsx
  - src/components/common/DataFreshnessIndicator.tsx (数据时效提示，格式: "X分钟前更新")
  - src/components/common/ErrorState.tsx (错误状态，支持重试按钮)
  - src/components/common/Button.tsx (通用按钮，内置悬停动效)
- 使用React Router配置路由
- 安装依赖：tailwindcss, postcss, autoprefixer, framer-motion
- Button组件悬停效果：hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200

## Dependencies

- None

## Definition of Done

- [ ] Tailwind配置包含MLB色彩主题
- [ ] 响应式断点正确配置
- [ ] HomePage页面组件可访问
- [ ] Navbar和Footer组件渲染正常
- [ ] Skeleton组件可复用
- [ ] DataFreshnessIndicator组件支持时间格式化显示
- [ ] ErrorState组件支持重试回调
- [ ] Button组件内置悬停动效（translateY -2px + 阴影）
- [ ] 所有组件通过基础测试
