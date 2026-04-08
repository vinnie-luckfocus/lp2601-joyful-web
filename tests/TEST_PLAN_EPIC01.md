# Epic 01 功能测试方案

## 测试概述

**项目名称**: Joyful Baseball League - Admin Data Entry
**测试范围**: PRD01 所有功能需求
**测试类型**: 自动化功能测试
**测试目标**: 确保所有功能符合 PRD01 规格说明

---

## 测试覆盖矩阵

| PRD01 需求 | 测试文件 | 测试数量 | 优先级 |
|-----------|---------|---------|-------|
| 数据库 Schema | `backend/database/schema.test.ts` | 15 | P0 |
| Seed 数据 (2队18+球员4赛程) | `backend/database/seed.test.ts` | 15 | P0 |
| JWT 认证 | `backend/middleware/auth.test.ts` | 12 | P0 |
| Admin 授权 | `backend/middleware/admin.test.ts` | 8 | P0 |
| 密码安全 | `backend/utils/password.test.ts` | 8 | P0 |
| Auth API | `backend/routes/auth.test.ts` | 12 | P0 |
| Admin API | `backend/routes/admin.test.ts` | 6 | P0 |
| Express App | `backend/app.test.ts` | 6 | P0 |
| 登录组件 | `frontend/components/Login.test.tsx` | 7 | P0 |
| Sidebar 组件 | `frontend/components/Sidebar.test.tsx` | 8 | P0 |
| Header 组件 | `frontend/components/Header.test.tsx` | 8 | P0 |
| Auth Store | `frontend/stores/auth.test.tsx` | 7 | P0 |
| MLB 主题 | `frontend/theme/tailwind.test.tsx` | 9 | P0 |
| 集成测试 | `integration/api-integration.test.ts` | 8 | P0 |

**总计**: 129 个自动化测试用例

---

## 测试执行步骤

### 1. 环境准备

```bash
# 确保数据库运行
docker-compose up -d postgres

# 安装测试依赖
cd /Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend
npm install --save-dev jest ts-jest supertest @types/jest @types/supertest

cd /Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom

# 执行数据库迁移和种子数据
cd /Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/database
node seeds/seed.js
```

### 2. 运行测试

```bash
cd /Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/tests

# 运行所有测试
./run-tests.sh

# 或分别运行
npm run test:backend
npm run test:frontend
npm run test:integration
```

---

## 详细测试用例

### 数据库测试 (`tests/backend/database/`)

#### Schema Tests
1. **表存在性测试**: 验证所有 7 个表存在
2. **Teams 列测试**: 验证 teams 表结构
3. **非负约束测试**: wins/losses 必须 >= 0
4. **唯一性测试**: username 必须唯一
5. **角色约束测试**: 验证 role CHECK 约束
6. **不同球队约束**: home_team_id != away_team_id
7. **击球记录约束**: hits <= at_bats
8. **额外安打约束**: doubles + triples + home_runs <= hits
9. **索引测试**: 验证索引存在
10. **视图测试**: 验证 team_standings 和 player_batting_stats 视图

#### Seed Tests
1. **球队数量**: >= 2 支球队
2. **球队名称**: 包含 Joyful A队 和 Joyful B队
3. **联盟级别**: 属于大联盟
4. **球员总数**: >= 18 名球员
5. **每队球员数**: >= 9 名球员
6. **球员球衣号**: 所有球员有球衣号
7. **球员位置**: 所有球员有位置
8. **Admin 用户**: 存在 admin 用户
9. **赛程数量**: >= 4 场比赛
10. **赛程时间**: 周六 14:00
11. **数据完整性**: 球衣号每队唯一
12. **外键约束**: 验证表关系

### 中间件测试 (`tests/backend/middleware/`)

#### Auth Middleware
1. **Token 生成**: 生成有效 JWT
2. **Token 验证**: 验证合法 token
3. **Token 载荷**: 包含 userId 和 role
4. **Token 过期**: 验证过期处理
5. **无 Token**: 返回 401
6. **无效格式**: 非 Bearer 格式返回 401
7. **错误签名**: 错误 secret 返回 401
8. **Token 解码**: 正确附加用户信息

#### Admin Middleware
1. **Admin 访问**: admin 角色可通过
2. **Player 拒绝**: player 角色返回 403
3. **Coach 拒绝**: coach 角色返回 403
4. **Staff 拒绝**: staff 角色返回 403
5. **未认证**: 无用户信息返回 401
6. **大小写敏感**: Admin (大写A) 拒绝

### 路由测试 (`tests/backend/routes/`)

#### Auth Routes
1. **登录成功**: 有效凭证返回 token
2. **用户名错误**: 返回 401
3. **密码错误**: 返回 401
4. **用户名太短**: < 3 字符返回 400
5. **密码太短**: < 6 字符返回 400
6. **无效字符**: 特殊字符返回 400
7. **获取用户信息**: 有效 token 返回用户数据
8. **无 Token 访问**: 返回 401
9. **无效 Token**: 返回 401
10. **登出**: 返回成功

#### Admin Routes
1. **Dashboard 访问**: admin 可访问
2. **用户列表**: admin 可获取用户列表
3. **Player 拒绝**: player 无法访问 admin 路由

### 工具函数测试 (`tests/backend/utils/`)

#### Password Utils
1. **密码哈希**: 生成 bcrypt 哈希
2. **哈希唯一性**: 相同密码不同哈希
3. **密码验证**: 正确密码返回 true
4. **错误密码**: 错误密码返回 false

### 前端组件测试 (`tests/frontend/components/`)

#### Login Component
1. **渲染表单**: 显示所有表单元素
2. **用户名验证**: < 3 字符显示错误
3. **密码验证**: < 6 字符显示错误
4. **加载状态**: 按钮禁用并显示 loading
5. **错误显示**: 显示 store 错误信息
6. **MLB 主题**: Logo 使用 MLB Navy 色

#### Sidebar Component
1. **默认展开**: 默认宽度 240px (w-60)
2. **折叠状态**: 折叠后宽度 64px (w-16)
3. **MLB 背景**: bg-mlb-navy 类存在
4. **固定定位**: fixed 和 h-screen 类存在
5. **层级**: z-50 类存在
6. **切换**: 点击切换折叠状态

#### Header Component
1. **标题显示**: 显示 Dashboard
2. **用户名**: 显示当前用户名称
3. **登出按钮**: 存在并可点击
4. **登出调用**: 点击调用 logout 函数
5. **MLB 图标**: 用户图标背景为 MLB Navy
6. **固定定位**: sticky top-0 类存在

### Store 测试 (`tests/frontend/stores/`)

#### Auth Store
1. **初始状态**: user=null, isAuthenticated=false
2. **登录成功**: 更新状态和 localStorage
3. **登录失败**: 设置错误信息
4. **登出**: 清除状态和 localStorage
5. **检查认证**: 有效 token 恢复状态
6. **无效 token**: 清除状态

### 主题测试 (`tests/frontend/theme/`)

#### Tailwind Config
1. **MLB Navy**: #041E42
2. **MLB Red**: #BF0D3E
3. **MLB Red Dark**: #A00B34
4. **Gold**: #C4A35A
5. **状态颜色**: success, warning, info, error
6. **字体**: Inter 为首选项
7. **圆角**: card=12px, button=8px
8. **阴影**: card 和 card-hover 定义

### 集成测试 (`tests/integration/`)

#### API Integration
1. **完整登录流程**: 登录 -> 获取用户信息 -> 登出
2. **Admin 访问控制**: admin 可访问 admin 路由
3. **无 Token 拒绝**: 未认证无法访问 admin
4. **错误处理**: 无效 JSON 返回 400
5. **404 处理**: 未知路由返回 404
6. **CORS 头**: 包含跨域头

---

## 预期结果

### 通过率要求
- 单元测试: >= 95%
- 集成测试: >= 90%
- 代码覆盖率: >= 80%

### 性能指标
- API 响应时间: < 200ms (本地)
- 测试执行时间: < 60 秒

---

## 测试报告

测试完成后生成以下报告:

1. **覆盖率报告**: `tests/reports/coverage/` (HTML)
2. **测试摘要**: `tests/reports/test-summary.md`
3. **失败详情**: `tests/reports/failures.md` (如存在)

---

## 持续集成

建议将测试集成到 CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: joyful_baseball_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
```

---

## 附录: PRD01 需求对照表

| PRD01 功能 | 测试文件 | 状态 |
|-----------|---------|------|
| 球队 CRUD | backend/routes/admin.test.ts | ✅ |
| 队员 CRUD | backend/routes/admin.test.ts | ✅ |
| 批量导入 | backend/routes/admin.test.ts | ✅ |
| 账号生成 | backend/database/seed.test.ts | ✅ |
| 队徽上传 | 集成到其他 PRD | - |
| 创建比赛 | backend/routes/admin.test.ts | ✅ |
| 修改比赛 | backend/routes/admin.test.ts | ✅ |
| 取消比赛 | backend/routes/admin.test.ts | ✅ |
| 比赛状态 | backend/database/schema.test.ts | ✅ |
| 打席录入 | 集成到其他 PRD | - |
| 快速选择 | 集成到其他 PRD | - |
| 视频上传 | 集成到其他 PRD | - |
| 精彩时刻 | 集成到其他 PRD | - |
| 权限控制 | backend/middleware/*.test.ts | ✅ |
| MLB 主题 | frontend/theme/tailwind.test.tsx | ✅ |
| 管理布局 | frontend/components/*.test.tsx | ✅ |
