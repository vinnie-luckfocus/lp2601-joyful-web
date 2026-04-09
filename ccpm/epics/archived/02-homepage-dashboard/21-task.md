---
issue: 21
name: "009: 集成测试与端到端测试"
status: open
created: 2026-04-08T06:14:45Z
updated: 2026-04-08T06:43:22Z
effort: 12h
parallel: false
depends_on: [13, 14, 15, 16, 17, 18, 19, 20]
---

# 009: 集成测试与端到端测试

## Description

验证所有模块集成后的整体功能、性能和用户体验

## Acceptance Criteria

1. 所有模块集成后功能正常
2. 页面加载性能测试（Lighthouse各维度分数）
3. 响应式适配测试（6个断点：320px, 375px, 768px, 1024px, 1440px, 1920px）
4. 所有跳转链接功能验证
5. 无障碍测试（axe-core无critical错误）
6. 键盘导航完整性测试
7. 端到端用户流程测试（潜在队员浏览 -> 点击登录）
8. SEO配置验证（meta标签、Open Graph）

## Technical Details

- Files:
  - tests/integration/homepage.spec.ts
  - tests/e2e/visitor-journey.spec.ts
  - .lighthouserc.js (Lighthouse CI配置)
- 测试工具:
  - Playwright (E2E测试)
  - Lighthouse CI (性能测试)
  - axe-core (无障碍测试)
- Lighthouse目标分数:
  - Performance: ≥ 90
  - Accessibility: ≥ 95
  - Best Practices: ≥ 90
  - SEO: ≥ 95
- 测试覆盖:
  - 首页完整渲染
  - API错误降级场景
  - 移动端触摸交互
  - 动画性能（60fps）

## Dependencies

- Issue #13: 基础布局与主题配置
- Issue #14: 公开API接口设计
- Issue #15: Hero英雄区开发
- Issue #16: 赛程卡片组件
- Issue #17: 积分榜模块
- Issue #18: 数据排行榜模块
- Issue #19: 最近战报模块
- Issue #20: 响应式、动画优化与无障碍支持

## Definition of Done

- [ ] 集成测试用例全部通过
- [ ] E2E测试覆盖关键用户流程
- [ ] Lighthouse分数达标（Performance ≥ 90, Accessibility ≥ 95）
- [ ] 6个断点的响应式测试通过
- [ ] axe-core无障碍测试无critical/serious错误
- [ ] 键盘导航测试通过（Tab顺序正确）
- [ ] 所有跳转链接验证（包括"即将上线"处理）
- [ ] SEO meta标签验证
- [ ] 测试报告生成并归档
