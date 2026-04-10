---
name: 03-user-authentication-test-plan
status: completed
created: 2026-04-10T12:20:00Z
updated: 2026-04-10T12:20:00Z
---

# PRD 03 User Authentication - 测试方案

## 1. 测试目标

验证用户认证系统的完整性和安全性，包括登录、JWT 认证、首次登录改密、权限控制等。

## 2. 现状审查结果

### 2.1 Backend

| 功能 | 文件路径 | 状态 |
|------|---------|------|
| 登录接口 | `backend/src/routes/auth.ts` | 已实现，覆盖率 84.28% |
| JWT 中间件 | `backend/src/middleware/auth.ts` | 已测试，覆盖率 >= 80% |
| 改密接口 | `backend/src/routes/auth.ts` | 已实现 |

### 2.2 Frontend

| 功能 | 文件路径 | 状态 |
|------|---------|------|
| Login 页面 | `frontend/src/pages/Login/index.tsx` | 已测试，覆盖率 100% |
| LoginModal 组件 | `frontend/src/components/LoginModal.tsx` | 已测试 |
| ProtectedRoute | `frontend/src/components/ProtectedRoute/index.tsx` | 新增测试，覆盖率 100% |
| Auth Store | `frontend/src/stores/auth.ts` | 补充测试后覆盖率 100% |

## 3. 测试用例设计

### Backend 集成测试

#### `backend/src/__tests__/routes/auth.test.ts`
- [x] `POST /auth/login` - 正常登录返回 token
- [x] `POST /auth/login` - 错误密码返回 401
- [x] `POST /auth/login` - 缺少字段验证
- [x] `POST /auth/change-password` - 正常改密
- [x] `POST /auth/change-password` - 未认证返回 401

#### `backend/src/__tests__/middleware/auth.test.ts`
- [x] 有效 token 放行
- [x] 无效 token 返回 401
- [x] 缺失 token 返回 401
- [x] 非 admin 角色访问 admin 路由返回 403

### Frontend 组件/Store 测试

#### `frontend/src/__tests__/stores/auth.test.ts`
- [x] 初始状态
- [x] `login` 成功更新状态
- [x] `login` 失败显示错误（含 API 错误和无响应错误）
- [x] `logout` 清除状态
- [x] `checkAuth` 有效 token
- [x] `checkAuth` 无效 token 清除状态
- [x] `checkAuth` 无 token 直接返回
- [x] `changePassword` 成功更新 `is_first_login`
- [x] `changePassword` 失败显示错误
- [x] `changePassword` 401 响应触发登出

#### `frontend/src/__tests__/components/ProtectedRoute.test.tsx`（新增）
- [x] 加载状态显示 spinner
- [x] 未认证重定向到 /login
- [x] 已认证渲染子路由
- [x] 挂载时调用 checkAuth

## 4. 覆盖率结果

- backend auth routes: 84.28%
- backend auth middleware: >= 80%
- frontend Login: 100%
- frontend ProtectedRoute: 100%
- frontend auth store: 100%

## 5. 缺陷跟踪

| 缺陷 ID | 问题描述 | 修复状态 |
|--------|---------|---------|
| - | ProtectedRoute 无测试 | 已修复，新增 4 个测试用例 |
| - | auth store changePassword 无测试 | 已修复，新增 3 个测试用例 |

## 6. 结论

PRD 03 所有核心认证功能均已通过测试验证，覆盖率达到项目要求。
