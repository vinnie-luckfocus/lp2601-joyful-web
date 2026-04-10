---
name: 01-admin-data-entry-test-plan
status: in-progress
created: 2026-04-10T11:56:55Z
updated: 2026-04-10T11:56:55Z
---

# PRD 01 Admin Data Entry - 测试方案

## 1. 测试目标

验证管理后台框架和入口功能是否完整实现，包括：
- Admin 路由权限保护
- Admin 布局组件（Sidebar、AdminLayout）
- Admin Dashboard 首页
- Admin 子页面导航和渲染
- Backend admin 中间件和已有 API

## 2. 现状审查结果

### 2.1 已实现功能

| 功能 | 文件路径 | 状态 |
|------|---------|------|
| Admin 路由保护 | `frontend/src/routes.tsx` | 已用 `ProtectedRoute` 包裹 6 个 admin 路由 |
| ProtectedRoute 组件 | `frontend/src/components/ProtectedRoute/index.tsx` | 完整实现 |
| AdminLayout 组件 | `frontend/src/components/Layout/index.tsx` | 完整实现 |
| Sidebar 组件 | `frontend/src/components/Layout/Sidebar.tsx` | 完整实现，含折叠/展开 |
| Admin 导航菜单 | `frontend/src/config/menu.ts` | 6 个菜单项已定义 |
| Admin Dashboard | `frontend/src/pages/Admin/index.tsx` | 已实现统计卡片 + Quick Actions |
| Admin 子页面占位 | `frontend/src/pages/Admin/Teams/Players/Games/Stats/Videos.tsx` | 仅占位框架 |
| Backend admin 中间件 | `backend/src/middleware/admin.ts` | 完整实现 |
| Backend admin 路由 | `backend/src/routes/admin/index.ts` | 仅 `/dashboard` + `/users` |

### 2.2 缺失/占位功能

| 功能 | 说明 | 备注 |
|------|------|------|
| 球队 CRUD API | `POST/PUT/DELETE /api/admin/teams` | 未实现，依赖 PRD 05 |
| 队员 CRUD API | `POST/PUT/DELETE /api/admin/users` | 仅 GET 实现 |
| 赛程 CRUD API | `POST/PUT/DELETE /api/admin/games` | 未实现，依赖 PRD 04 |
| 打席录入 API | `POST/PUT /api/admin/games/:id/batting-records` | 未实现，依赖 PRD 07 |
| 视频上传 API | `POST /api/admin/videos` | 未实现，依赖 PRD 08 |
| Admin 子页面内容 | Teams/Players/Games/Stats/Videos | 均为"即将上线"占位 |

**结论**：PRD 01 作为"框架和入口"已基本实现，具体业务功能由其他 PRD 负责。本测试重点验证**框架完整性**和**已有功能的正确性**。

## 3. 测试用例设计

### 3.1 Backend 集成测试

#### `backend/src/__tests__/middleware/admin.test.ts`（已有）
- [x] admin 用户通过
- [x] 未认证返回 401
- [x] player/coach/staff 返回 403
- [x] 大小写敏感检查

#### `backend/src/__tests__/routes/admin.test.ts`（已有 + 补充）
- [x] `GET /api/admin/dashboard` - admin 访问成功
- [x] `GET /api/admin/dashboard` - player 拒绝 (403)
- [x] `GET /api/admin/dashboard` - 未认证拒绝 (401)
- [x] `GET /api/admin/dashboard` - 无效 token (401)
- [x] `GET /api/admin/users` - admin 返回用户列表
- [x] `GET /api/admin/users` - player 拒绝 (403)
- [x] `GET /api/admin/users` - 数据库错误处理 (500)
- [ ] `GET /api/admin/users` - 返回空数组边界
- [ ] `GET /api/admin/users` - 返回字段校验（id, name, role, team_id）

### 3.2 Frontend 组件测试（新增/补充）

#### `frontend/src/__tests__/pages/Admin/index.test.tsx`（新增）
- [ ] 渲染加载状态
- [ ] API 成功后渲染 4 个统计卡片（Teams/Players/Games/Videos）
- [ ] 渲染 Quick Actions 链接（Teams/Players/Games）
- [ ] API 失败时优雅处理（不崩溃，结束 loading）
- [ ] href 链接指向正确路径

#### `frontend/src/__tests__/components/Layout/AdminLayout.test.tsx`（新增）
- [ ] 渲染 Sidebar + Header + ContentArea
- [ ] Sidebar 折叠时内容区 margin 变化（ml-16 / ml-60）
- [ ] 点击折叠按钮触发状态变化

#### `frontend/src/__tests__/pages/Admin/Teams.test.tsx`（新增）
- [ ] 使用 AdminLayout 包裹
- [ ] 渲染标题"球队管理"
- [ ] 渲染占位提示

#### `frontend/src/__tests__/pages/Admin/Players.test.tsx`（新增）
- [ ] 使用 AdminLayout 包裹
- [ ] 渲染标题"队员管理"
- [ ] 渲染占位提示

#### `frontend/src/__tests__/pages/Admin/Games.test.tsx`（新增）
- [ ] 使用 AdminLayout 包裹
- [ ] 渲染标题"赛程管理"
- [ ] 渲染占位提示

#### `frontend/src/__tests__/pages/Admin/Stats.test.tsx`（新增）
- [ ] 使用 AdminLayout 包裹
- [ ] 渲染标题"数据录入"
- [ ] 渲染占位提示

#### `frontend/src/__tests__/pages/Admin/Videos.test.tsx`（新增）
- [ ] 使用 AdminLayout 包裹
- [ ] 渲染标题"视频管理"
- [ ] 渲染占位提示

### 3.3 E2E / 路由测试（补充）

#### `frontend/src/__tests__/routes.tsx` 或新增路由测试
- [ ] `/admin` 路由存在于 ProtectedRoute 内
- [ ] `/admin/teams` 等 5 个子路由正确配置

## 4. 缺陷跟踪表

| 缺陷 ID | 问题描述 | 严重程度 | 修复状态 | 对应 Commit |
|--------|---------|---------|---------|-------------|
| - | - | - | - | - |

## 5. 执行计划

1. **补充 Backend 测试**（`admin.test.ts` - 空数组 + 字段校验）
2. **新增 Frontend 组件测试**（Admin Dashboard + AdminLayout + 5 个子页面）
3. **运行测试并修复失败项**
4. **检查测试覆盖率**
5. **提交代码**

## 6. 预期覆盖率

- backend admin middleware: 已 >= 80%
- backend admin routes: 补充后 >= 80%
- frontend Admin 相关组件: 新增测试后 >= 80%
