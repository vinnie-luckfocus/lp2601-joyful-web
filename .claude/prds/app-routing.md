---
name: app-routing
description: Joyful联赛网站应用路由和导航结构设计，包含所有页面路由定义、导航布局、权限控制
created: 2026-04-07T15:01:11Z
status: complete
---

# PRD: Application Routing & Navigation

## Executive Summary

本文档定义Joyful棒球联赛网站的完整路由结构和导航系统，包括所有页面URL、布局模式、权限控制和导航交互设计。确保用户能够顺畅地在各功能模块间切换。

---

## 1. 路由总览

### 1.1 路由结构图

```
/                           首页 (公开)
├── /schedule               赛程日历 (公开/需登录报名)
│   └── /schedule/:id       比赛详情
├── /team                   球队列表 (公开)
│   └── /team/:id           球队详情
│       └── /team/:id/tactics  战术板 (需登录)
├── /stats                  数据统计 (公开)
│   ├── /stats/leaders      排行榜
│   └── /stats/me           我的数据 (需登录)
├── /video                  视频回放 (需登录)
│   └── /video/:id          视频播放页
├── /login                  登录页
├── /profile                个人中心 (需登录)
│   └── /profile/password   修改密码
│
└── /admin                  管理后台 (仅管理员)
    ├── /admin/dashboard    管理首页
    ├── /admin/teams        球队管理
    ├── /admin/users        队员管理
    ├── /admin/games        赛程管理
    ├── /admin/games/:id/data   数据录入
    └── /admin/videos       视频管理
```

### 1.2 路由分类

| 类别 | 路由前缀 | 访问要求 | 示例 |
|------|----------|----------|------|
| 公开路由 | `/` | 无需登录 | `/`, `/schedule`, `/team` |
| 认证路由 | `/login` | 仅未登录 | `/login` |
| 需登录路由 | `/profile`, `/stats/me` | 需要登录 | `/stats/me`, `/team/:id/tactics` |
| 管理员路由 | `/admin` | 需要admin角色 | `/admin/*` |

---

## 2. 页面路由定义

### 2.1 公开页面

#### 首页 `/`

| 属性 | 值 |
|------|-----|
| 名称 | HomePage |
| 访问权限 | 公开 |
| 布局 | 标准布局 (顶部导航 + 内容区) |
| 描述 | 联赛看板，展示最新动态 |

**页面区块**:
- Hero区 (联赛名称 + 简介)
- 下场比赛卡片
- 积分榜速览
- 排行榜速览
- 近期战报

#### 赛程页面 `/schedule`

| 属性 | 值 |
|------|-----|
| 名称 | SchedulePage |
| 访问权限 | 公开 |
| 布局 | 标准布局 + 日期选择器 |
| 描述 | 日历形式展示所有比赛 |

**子路由**:
- `/schedule` - 默认显示本月赛程
- `/schedule?month=2024-01` - 指定月份
- `/schedule/:id` - 比赛详情弹窗/页面

#### 球队列表 `/team`

| 属性 | 值 |
|------|-----|
| 名称 | TeamsPage |
| 访问权限 | 公开 |
| 布局 | 标准布局 + 卡片网格 |
| 描述 | 展示所有参赛球队 |

#### 球队详情 `/team/:id`

| 属性 | 值 |
|------|-----|
| 名称 | TeamDetailPage |
| 访问权限 | 公开 |
| 布局 | 标准布局 + Tab导航 |
| 描述 | 展示球队信息和队员名单 |

**Tab页**:
- 球队简介
- 队员名单
- 近期战绩
- 战术板 (仅队员可见)

#### 数据统计 `/stats`

| 属性 | 值 |
|------|-----|
| 名称 | StatisticsPage |
| 访问权限 | 公开 |
| 布局 | 标准布局 + Tab导航 |
| 描述 | 联赛整体数据统计 |

**子路由**:
- `/stats/leaders` - 排行榜 (打击率、ERA等)

### 2.2 需登录页面

#### 登录页 `/login`

| 属性 | 值 |
|------|-----|
| 名称 | LoginPage |
| 访问权限 | 仅未登录用户 |
| 布局 | 简洁布局 (无导航栏) |
| 描述 | 用户登录入口 |

**行为**:
- 已登录用户访问 → 重定向到 `/`
- 登录成功 → 重定向到原目标页或 `/`

#### 我的数据 `/stats/me`

| 属性 | 值 |
|------|-----|
| 名称 | MyStatsPage |
| 访问权限 | 需登录 |
| 布局 | 标准布局 |
| 描述 | 展示当前登录用户的个人统计数据 |

**内容**:
- 个人赛季数据概览
- 近期表现趋势图
- 详细数据表格

#### 战术板 `/team/:id/tactics`

| 属性 | 值 |
|------|-----|
| 名称 | TacticsBoardPage |
| 访问权限 | 需登录且是该队队员 |
| 布局 | 全宽布局 (最大化战术板空间) |
| 描述 | 查看棒次和布阵图 |

#### 视频回放 `/video`

| 属性 | 值 |
|------|-----|
| 名称 | VideosPage |
| 访问权限 | 需登录 |
| 布局 | 标准布局 + 视频网格 |
| 描述 | 比赛录像列表 |

**子路由**:
- `/video/:id` - 视频播放页

#### 个人中心 `/profile`

| 属性 | 值 |
|------|-----|
| 名称 | ProfilePage |
| 访问权限 | 需登录 |
| 布局 | 标准布局 |
| 描述 | 个人信息和设置 |

**子路由**:
- `/profile/password` - 修改密码

### 2.3 管理员页面

#### 管理后台 `/admin`

| 属性 | 值 |
|------|-----|
| 名称 | AdminDashboard |
| 访问权限 | 仅管理员角色 |
| 布局 | 管理布局 (侧边栏 + 内容区) |
| 描述 | 管理后台首页 |

**子路由**:

| 路由 | 页面名称 | 功能描述 |
|------|----------|----------|
| `/admin/teams` | AdminTeamsPage | 球队管理 (CRUD) |
| `/admin/users` | AdminUsersPage | 队员管理 (CRUD + 导入) |
| `/admin/games` | AdminGamesPage | 赛程管理 (CRUD) |
| `/admin/games/:id/data` | AdminDataEntryPage | 比赛数据录入 |
| `/admin/videos` | AdminVideosPage | 视频上传管理 |

---

## 3. 导航设计

### 3.1 顶部导航栏

**显示位置**: 桌面端所有页面

**内容**:
```
[Logo]  Joyful联赛    [首页] [赛程] [球队] [数据] [视频]    [登录/头像]
```

**交互**:
- 滚动时固定顶部
- 当前页面高亮
- 头像点击展开下拉菜单 (个人中心/退出)

### 3.2 底部Tab栏 (移动端)

**显示位置**: 移动端主要页面

**Tab项**:
```
[首页]  [赛程]  [球队]  [数据]  [我的]
```

**图标对应**:
| Tab | 图标 | 路由 |
|-----|------|------|
| 首页 | Home | `/` |
| 赛程 | Calendar | `/schedule` |
| 球队 | Users | `/team` |
| 数据 | BarChart | `/stats` |
| 我的 | User | `/profile` |

**当前选中状态**:
- 图标变为填充样式
- 文字颜色变为主色 `#ed8936`
- 可选：轻微上浮动画

### 3.3 管理员侧边栏

**显示位置**: 管理后台所有页面

**菜单项**:
```
[Logo] 管理后台

📊 概览        → /admin/dashboard
⚙️ 球队管理     → /admin/teams
👤 队员管理     → /admin/users
📅 赛程管理     → /admin/games
📈 数据录入     → /admin/games/:id/data
🎥 视频管理     → /admin/videos

───────────────
🏠 返回前台     → /
```

**行为**:
- 默认收起 (显示图标)
- 悬停/点击展开显示文字
- 当前页面高亮

---

## 4. 路由守卫

### 4.1 权限控制矩阵

| 路由 | 未登录 | 普通队员 | 队长 | 管理员 |
|------|--------|----------|------|--------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/schedule` | ✅ | ✅ | ✅ | ✅ |
| `/team/:id` | ✅ | ✅ | ✅ | ✅ |
| `/stats` | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ❌(重定向/) | ❌ | ❌ |
| `/stats/me` | ❌(去登录) | ✅ | ✅ | ✅ |
| `/team/:id/tactics` | ❌ | ✅(同队) | ✅ | ✅ |
| `/video` | ❌ | ✅ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ❌ | ✅ |

### 4.2 路由守卫实现

```typescript
// 路由守卫逻辑
interface RouteGuard {
  path: string;
  requireAuth: boolean;
  requireRole?: 'admin' | 'captain';
  requireTeamMember?: boolean;
}

// 守卫行为
const guards: RouteGuard[] = [
  { path: '/', requireAuth: false },
  { path: '/schedule', requireAuth: false },
  { path: '/stats/me', requireAuth: true },
  { path: '/admin/*', requireAuth: true, requireRole: 'admin' },
  { path: '/team/:id/tactics', requireAuth: true, requireTeamMember: true },
];
```

**未登录处理**:
- 访问需登录页面 → 跳转 `/login`，记录原目标
- 登录成功后 → 返回原目标页

**无权限处理**:
- 访问无权限页面 → 显示403页面或返回首页
- 显示提示："您没有权限访问此页面"

---

## 5. 页面布局规范

### 5.1 布局类型

#### 标准布局 (StandardLayout)

**使用页面**: 大部分前台页面

```
┌─────────────────────────────┐
│       顶部导航栏 (56px)      │
├─────────────────────────────┤
│                             │
│         内容区域             │
│       (min-height: calc     │
│        (100vh - 56px))      │
│                             │
├─────────────────────────────┤ (移动端)
│     底部Tab栏 (56px)        │
└─────────────────────────────┘
```

**样式规范**:
- 顶部导航: 固定高度56px，主色背景 `#1a365d`
- 内容区: 白色背景，页面级边距
- 移动端底部Tab: 固定高度56px，白色背景，顶部边框

#### 简洁布局 (SimpleLayout)

**使用页面**: `/login`

```
┌─────────────────────────────┐
│                             │
│         居中内容            │
│        (登录卡片)           │
│                             │
└─────────────────────────────┘
```

**样式规范**:
- 无导航栏
- 背景渐变或纯色
- 内容垂直水平居中

#### 管理布局 (AdminLayout)

**使用页面**: `/admin/*`

```
┌──────────┬──────────────────┐
│          │                  │
│ 侧边栏    │    内容区域       │
│ (200px)  │   (flex: 1)      │
│          │                  │
│          │                  │
│          │                  │
└──────────┴──────────────────┘
```

**样式规范**:
- 侧边栏: 宽度200px，深色背景 `#1a365d`
- 内容区: 白色背景，内部滚动
- 响应式: 移动端侧边栏可收起为抽屉

#### 全宽布局 (FullWidthLayout)

**使用页面**: `/team/:id/tactics`

```
┌─────────────────────────────┐
│       顶部导航栏             │
├─────────────────────────────┤
│                             │
│      全宽内容区域            │
│    (战术板最大化空间)         │
│                             │
└─────────────────────────────┘
```

### 5.2 响应式适配

| 断点 | 布局变化 |
|------|----------|
| < 640px | 移动端：底部Tab导航，单列布局 |
| 640px - 1024px | 平板：顶部导航，可双列布局 |
| > 1024px | 桌面：顶部导航 + 侧边栏，多列布局 |

---

## 6. 导航交互

### 6.1 页面切换动效

**进入动画**:
```css
/* 淡入 + 轻微上移 */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* duration: 300ms, easing: ease-out */
```

**离开动画**:
```css
/* 淡出 */
@keyframes pageLeave {
  from { opacity: 1; }
  to { opacity: 0; }
}
/* duration: 150ms, easing: ease-in */
```

### 6.2 加载状态

**全局加载指示器**:
- 页面切换时显示顶部进度条
- API请求时显示全局loading状态

**骨架屏**:
- 首屏关键内容使用骨架屏占位
- 异步数据区域使用骨架屏过渡

### 6.3 错误页面

**404 页面**:
```
┌─────────────────┐
│   404           │
│ 页面不存在       │
│                 │
│ [返回首页]      │
└─────────────────┘
```

**403 页面**:
```
┌─────────────────┐
│   403           │
│ 无权访问        │
│                 │
│ [返回首页]      │
└─────────────────┘
```

---

## 7. URL设计规范

### 7.1 命名规范

**小写+连字符**:
- ✅ `/game-schedule`
- ❌ `/gameSchedule`
- ❌ `/Game_Schedule`

**RESTful风格**:
- 列表: `/resources`
- 详情: `/resources/:id`
- 编辑: `/resources/:id/edit` (管理后台)

**中文路径**:
- 避免使用中文URL
- 使用拼音或英文: `/team` 而非 `/球队`

### 7.2 查询参数

**分页**:
```
/schedule?page=1&pageSize=20
```

**筛选**:
```
/schedule?month=2024-01&team=1
```

**排序**:
```
/stats/leaders?sort=avg&order=desc
```

### 7.3 路由参数

**资源ID**:
```
/team/:id           → /team/123
/schedule/:id       → /schedule/456
/video/:id          → /video/789
```

**嵌套资源**:
```
/team/:id/tactics   → /team/123/tactics
/admin/games/:id/data → /admin/games/456/data
```

---

## 8. 实现参考

### 8.1 React Router配置示例

```typescript
// router.tsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  // 公开路由
  {
    path: '/',
    element: <StandardLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'schedule/:id', element: <GameDetailPage /> },
      { path: 'team', element: <TeamsPage /> },
      { path: 'team/:id', element: <TeamDetailPage /> },
      { path: 'stats', element: <StatisticsPage /> },
      { path: 'stats/leaders', element: <LeadersPage /> },
    ],
  },
  // 登录
  {
    path: '/login',
    element: <SimpleLayout />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  // 需登录路由
  {
    path: '/',
    element: <ProtectedRoute><StandardLayout /></ProtectedRoute>,
    children: [
      { path: 'stats/me', element: <MyStatsPage /> },
      { path: 'video', element: <VideosPage /> },
      { path: 'video/:id', element: <VideoPlayerPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/password', element: <ChangePasswordPage /> },
    ],
  },
  // 战术板 (需同队验证)
  {
    path: '/team/:id/tactics',
    element: <ProtectedRoute requireTeamMember><TacticsBoardPage /></ProtectedRoute>,
  },
  // 管理后台
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'teams', element: <AdminTeamsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'games', element: <AdminGamesPage /> },
      { path: 'games/:id/data', element: <AdminDataEntryPage /> },
      { path: 'videos', element: <AdminVideosPage /> },
    ],
  },
]);
```

### 8.2 导航组件结构

```typescript
// 导航组件层次
<App>
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<StandardLayout />}>
          {/* 需要顶部导航和底部Tab的页面 */}
        </Route>
        <Route element={<AdminLayout />}>
          {/* 管理后台页面 */}
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
</App>
```

---

## 相关文档

- [UI/UX Guidelines](./ui-ux-guidelines.md) - UI设计规范
- [Tech Architecture](./tech-architecture.md) - 技术实现细节
- [User Authentication](./user-authentication.md) - 认证流程

---

**文档结束**
