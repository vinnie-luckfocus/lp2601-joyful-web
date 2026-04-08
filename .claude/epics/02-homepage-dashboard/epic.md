---
name: 02-homepage-dashboard
status: in-progress
created: 2026-04-08T06:14:45Z
updated: 2026-04-08T06:59:50Z
progress: 5%
prd: .claude/prds/02-homepage-dashboard.md
github: https://github.com/vinnie-luckfocus/lp2601-joyful-web/issues/12
---

# Epic: Homepage Dashboard

## Overview
构建面向公众的Joyful棒球联赛首页看板，展示赛程、积分榜、数据排行和最近战报。采用MLB风格设计，支持公开访问无需登录，首屏加载<2秒，具备良好的SEO和移动端适配。

## Architecture Decisions

### 技术栈
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **State**: React Query (TanStack Query) 用于服务端状态管理
- **Animation**: Framer Motion 实现入场动画和计数器效果
- **CDN**: Cloudflare/S3 CDN缓存静态资源5分钟

### 关键决策
- **公开API独立路由**: `/api/public/*` 与认证API分离，便于独立缓存和权限控制
- **SSG优先**: 使用Vite构建时生成静态HTML，提升SEO和首屏速度
- **Skeleton Loading**: 各模块使用骨架屏，提升感知性能
- **Mobile-First**: 响应式从移动端开始，向上适配桌面端

## Technical Approach

### Frontend Components

#### 核心组件
| 组件 | 描述 | 位置 |
|------|------|------|
| HeroSection | 英雄区，联赛名称、口号、背景图 | `src/components/hero/HeroSection.tsx` |
| GameCard | 单个赛程卡片 | `src/components/games/GameCard.tsx` |
| GameGrid | 赛程网格布局 | `src/components/games/GameGrid.tsx` |
| StandingsTable | 积分榜表格 | `src/components/standings/StandingsTable.tsx` |
| Leaderboard | 数据排行榜 | `src/components/leaders/Leaderboard.tsx` |
| RecentGames | 最近战报列表 | `src/components/games/RecentGames.tsx` |
| Navbar | 顶部导航栏（含登录入口） | `src/components/layout/Navbar.tsx` |
| Footer | 底部页脚 | `src/components/layout/Footer.tsx` |

#### 动画组件
- `FadeInUp`: 从下方淡入动画（英雄区文字）
- `StaggerContainer`: 依次滑入容器（赛程卡片）
- `CountUp`: 数字计数动画（排行榜）

#### Hooks
- `usePublicGames(limit)`: 获取近期比赛
- `useStandings()`: 获取积分榜
- `useLeaders(category, limit)`: 获取排行榜
- `useRecentGames(limit)`: 获取最近战报

#### 导航与跳转（"查看更多"）

| 模块 | 跳转目标 | 路由 | 说明 |
|------|----------|------|------|
| 赛程卡片 | 完整赛程页 | `/schedule` | 由PRD-04提供 |
| 积分榜 | 完整积分榜 | `/standings` | 本页展示全部，可能无需跳转 |
| 数据排行榜 | 完整数据统计 | `/statistics` | 由PRD-07提供 |
| 最近战报 | 比赛详情/战报列表 | `/games/:id` 或 `/reports` | 由PRD-09提供 |
| 登录按钮 | 登录页 | `/login` | 由PRD-03提供 |

**跳转实现**:
- 使用React Router的`useNavigate`或`Link`组件
- 未实现页面显示"即将上线"提示
- 外部链接使用`target="_blank" rel="noopener"`

### Backend Services

#### API Endpoints
```
GET /api/public/games?limit=4
Response: { games: [{ id, date, time, venue, home_team, away_team, status }] }

GET /api/public/standings
Response: { standings: [{ team_id, team_name, wins, losses, win_rate, rank }] }

GET /api/public/leaders?category=batting_avg|hits|hr|rbi&limit=10
Response: { leaders: [{ player_id, player_name, team_name, value, rank }] }

GET /api/public/recent-games?limit=3
Response: { games: [{ id, date, home_team, away_team, home_score, away_score, highlights }] }
```

#### 数据模型
使用现有的数据库表：
- `games`: 比赛信息
- `teams`: 球队信息
- `users`: 用户信息
- `batting_records`: 打击记录

#### 缓存策略
- HTTP Cache-Control: `max-age=300` (5分钟)
- 数据库查询结果Redis缓存
- 排行榜预计算（定时任务）

### Infrastructure

#### UI设计规范（MLB Style详细规范）

**色彩方案（Tailwind配置）**:
```javascript
// tailwind.config.js colors扩展
colors: {
  'mlb': {
    'navy': '#041E42',      // 英雄区背景、页脚
    'red': '#BF0D3E',       // 登录按钮、CTA
    'gold': '#C4A35A',      // 排名前三标识
    'blue': '#3182CE',      // 链接文字
  },
  'border': {
    'card': '#E2E8F0',      // 卡片边框
  }
}
```

**布局规范**:
| 元素 | 桌面端 | 移动端 | 备注 |
|------|--------|--------|------|
| 英雄区高度 | 60vh | 50vh | 底部渐变遮罩过渡到内容 |
| 赛程卡片网格 | 3列 | 1列 | gap: 24px |
| 卡片圆角 | 12px | 12px | rounded-xl |
| 积分榜+数据榜 | 左右分栏 (50%/50%) | 上下堆叠 | 分栏间距32px |
| 容器最大宽度 | 1280px | 100% | 居中布局 |
| 页面内边距 | px-8 (32px) | px-4 (16px) | 响应式内边距 |
| 页脚背景 | `#041E42` | `#041E42` | MLB Navy |

**动效规范**:
| 动画 | 时长 | 缓动函数 | 说明 |
|------|------|----------|------|
| 英雄区文字淡入 | 300ms | ease-out | 从下方20px淡入 |
| 赛程卡片滑入 | 400ms | ease-out | stagger 100ms依次进入 |
| 排行榜计数动画 | 800ms | ease-out | 从0计数到实际值 |
| 按钮悬停 | 200ms | ease | translateY(-2px) + 阴影加深 |

#### 性能优化
- 图片懒加载 + WebP格式
- 字体预加载
- 关键CSS内联
- 代码分割（React.lazy）

#### SEO
- 服务端渲染或预渲染
- meta标签优化
- Open Graph协议
- sitemap.xml生成

#### 监控
- Google Analytics 4
- 自定义埋点（登录按钮点击）
- Web Vitals监控（LCP, FID, CLS）

#### 错误处理与降级策略

**API错误处理**:
| 错误类型 | 处理策略 | 用户提示 |
|----------|----------|----------|
| 网络错误 | 3次指数退避重试 | "网络不稳定，正在重试..." |
| 服务器5xx | 显示缓存数据或占位符 | "数据暂时不可用，请稍后刷新" |
| 数据为空 | 显示空状态组件 | "暂无数据" |
| 超时(>5s) | 取消请求，显示骨架屏 | "加载超时，请点击刷新" |

**降级显示优先级**:
1. 本地缓存数据（Stale-While-Revalidate模式）
2. 骨架屏占位
3. 错误提示 + 重试按钮

#### 数据时效性提示

**缓存指示器**:
- 在每个数据模块右上角显示"更新时间"
- 格式: "5分钟前更新" 或 "刚刚"
- 超过5分钟显示为"数据可能有延迟"
- 悬停提示完整时间戳

**刷新机制**:
- 页面聚焦时自动刷新（visibilitychange事件）
- 下拉刷新（移动端）
- 手动刷新按钮

#### 无障碍访问（a11y）

**键盘导航**:
- Tab键顺序符合视觉流向
- Enter/Space激活按钮和链接
- Escape关闭弹窗/下拉菜单

**屏幕阅读器支持**:
- 所有图片含alt描述
- 表格使用th/scope标识行列标题
- 动态内容更新使用aria-live播报

**对比度**:
- 文字与背景对比度 ≥ 4.5:1
- 大文字对比度 ≥ 3:1
- 红色按钮(#BF0D3E)在白色背景上对比度符合WCAG AA

## Implementation Strategy

### 阶段1: 基础框架（3天）
1. 创建页面布局和路由
2. 配置Tailwind主题（MLB色彩方案）
3. 设置React Query客户端
4. 实现Skeleton组件

### 阶段2: 核心模块（5天）
1. 英雄区（含背景图和动效）
2. 赛程卡片（API + UI）
3. 积分榜（表格组件）
4. 数据排行榜（Tab切换 + 计数动画）

### 阶段3: 完善优化（3天）
1. 最近战报模块
2. 响应式适配
3. 动画优化
4. SEO配置
5. 性能测试

### 风险缓解
- 依赖公开API：先mock数据开发，后端API就绪后切换
- 首屏速度：使用骨架屏，关键CSS内联
- SEO：确保预渲染或SSR方案正确实施

## Task Breakdown Preview

- [ ] 1: 基础布局与主题配置（含Tailwind MLB色彩、通用组件库：Skeleton/DataFreshnessIndicator/ErrorState/Button）
- [ ] 2: 公开API接口设计（含错误处理、缓存策略、统一错误格式、highlights字段定义）
- [ ] 3: Hero英雄区开发（含背景图、动效、登录按钮）
- [ ] 4: 赛程卡片组件（含"查看更多"跳转、即将上线处理、数据时效提示）
- [ ] 5: 积分榜模块（含金色前三标识、空状态处理）
- [ ] 6: 数据排行榜模块（含Tab切换、计数动画、链接样式）
- [ ] 7: 最近战报模块（含比分展示、高亮数据）
- [ ] 8: 响应式、动画优化与无障碍支持
- [ ] 9: 集成测试与端到端测试（含Lighthouse、axe-core、E2E流程）

## Dependencies

### 外部依赖
- Tailwind CSS 3.x
- React Query 5.x
- Framer Motion 11.x
- React Router 6.x
- lucide-react (icons)

### 内部依赖
- PRD-04 (game-schedule): 比赛数据
- PRD-05 (team-management): 球队数据
- PRD-07 (statistics): 统计数据
- PRD-03 (user-authentication): 登录跳转

### 前提条件
- 数据库已初始化
- 基础API框架就绪
- 设计稿确认

## Success Criteria (Technical)

### 性能指标
- 首屏加载时间 < 2秒（3G网络）
- LCP < 2.5秒
- FID < 100ms
- CLS < 0.1

### 功能指标
- 所有4个公开API正常运行
- 响应式适配320px-1920px
- 动画流畅（60fps）

### 质量指标
- 测试覆盖率 > 80%
- 无P0/P1级别bug
- 通过性能审计（Lighthouse > 90）
- 通过无障碍测试（axe-core无critical错误）
- 键盘导航完整可用

## Estimated Effort

- **总工期**: 13-14个工作日
- **前端**: 8天（主要工作）
- **后端**: 2天（公开API）
- **测试优化**: 3天（含集成测试）

### 资源需求
- 1名全栈开发工程师
- 设计资源（MLB风格UI）

### 关键路径
1. 公开API开发 → 2. 赛程/积分榜模块 → 3. 响应式优化 → 4. 性能测试

## Tasks Created
- [ ] #13 - 001: 基础布局与主题配置 (parallel: true, effort: 8h)
- [ ] #14 - 002: 公开API接口设计 (parallel: true, effort: 16h)
- [ ] #15 - Hero英雄区开发 (parallel: true, effort: 8h, depends: #13)
- [ ] #16 - 赛程卡片组件 (parallel: true, effort: 12h, depends: #13, #14)
- [ ] #17 - 积分榜模块 (parallel: true, effort: 12h, depends: #13, #14)
- [ ] #18 - 数据排行榜模块 (parallel: true, effort: 14h, depends: #13, #14)
- [ ] #19 - 最近战报模块 (parallel: true, effort: 8h, depends: #13, #14)
- [ ] #20 - 响应式、动画优化与无障碍支持 (parallel: false, effort: 16h, depends: #13-#19)
- [ ] #21 - 009: 集成测试与端到端测试 (parallel: false, effort: 12h, depends: #13-#20)

**Total tasks**: 9
**Parallel tasks**: 7 (#13-#19 can run in parallel groups)
**Sequential tasks**: 2 (#20, #21 must wait for prerequisites)
**Estimated total effort**: 106 hours (~13-14 work days)
