---
name: tech-architecture
description: Joyful联赛网站技术架构设计，包含前后端技术栈、数据库设计、API规范、部署架构
created: 2026-04-07T15:01:11Z
status: complete
---

# PRD: Technical Architecture

## Executive Summary

本文档定义Joyful棒球联赛网站的技术架构，包括前后端技术选型、数据库设计、API规范和部署方案。为开发团队提供统一的技术参考标准。

---

## 1. 系统架构概览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           客户端层 (Client)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Web App    │  │   Mobile     │  │      Admin Dashboard     │  │
│  │  (React)     │  │   (H5)       │  │       (React)            │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
└─────────┼────────────────┼─────────────────────┼───────────────────┘
          │                │                     │
          └────────────────┴─────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   CDN / OSS   │
                    │  (静态资源)   │
                    └───────┬───────┘
                            │
┌───────────────────────────┼─────────────────────────────────────────┐
│                      API Gateway                                    │
│         (路由 / 限流 / 认证 / 日志)                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────────┐
│                      服务端层 (Server)                               │
├───────────────────────────┼─────────────────────────────────────────┤
│              ┌────────────┴────────────┐                           │
│              │     REST API Server     │                           │
│              │    (Node.js/Express)    │                           │
│              └────────────┬────────────┘                           │
│                           │                                        │
│     ┌─────────────────────┼─────────────────────┐                  │
│     │                     │                     │                  │
│ ┌───┴───┐           ┌────┴────┐          ┌─────┴─────┐            │
│ │ Auth  │           │  Data   │          │   Video   │            │
│ │Module │           │ Module  │          │  Module   │            │
│ └───┬───┘           └────┬────┘          └─────┬─────┘            │
└─────┼────────────────────┼─────────────────────┼──────────────────┘
      │                    │                     │
┌─────┴────────────────────┴─────────────────────┴──────────────────┐
│                      数据层 (Data)                                 │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL   │  │    Redis         │  │  Object Storage  │  │
│  │   (主数据库)   │  │   (缓存/会话)    │  │   (视频/图片)    │  │
│  └────────────────┘  └──────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 架构设计原则

1. **前后端分离**: 清晰的API边界，独立部署
2. **无状态服务**: 服务端不保存会话状态，使用JWT认证
3. **水平扩展**: 各层都可水平扩展，应对流量增长
4. **缓存优先**: 合理利用CDN和Redis缓存，减少数据库压力
5. **安全优先**: HTTPS全站，API认证，输入验证

---

## 2. 前端技术栈

### 2.1 核心技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.x | UI框架 |
| **TypeScript** | 5.x | 类型安全 |
| **Vite** | 5.x | 构建工具 |
| **Tailwind CSS** | 3.x | 原子化CSS |
| **React Router** | 6.x | 客户端路由 |

### 2.2 状态管理

| 技术 | 用途 |
|------|------|
| **Zustand** | 全局状态管理（用户状态、主题等） |
| **React Query** | 服务端状态管理（数据获取、缓存） |
| **React Hook Form** | 表单状态管理 |

### 2.3 UI组件库

| 技术 | 用途 |
|------|------|
| **Headless UI** | 无样式可访问组件（Dialog, Dropdown等） |
| **Framer Motion** | 动画库 |
| **Recharts** | 图表库 |
| **Lucide React** | 图标库 |

### 2.4 工具库

| 技术 | 用途 |
|------|------|
| **Axios** | HTTP客户端 |
| **date-fns** | 日期处理 |
| **zod** | 运行时类型验证 |
| **react-hot-toast** | Toast通知 |

### 2.5 项目结构

```
frontend/
├── src/
│   ├── api/                    # API客户端
│   │   ├── client.ts          # Axios实例
│   │   ├── auth.ts            # 认证相关API
│   │   ├── games.ts           # 赛程相关API
│   │   └── ...
│   ├── components/            # 组件
│   │   ├── ui/                # 基础UI组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── layout/            # 布局组件
│   │   │   ├── Navbar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── ...
│   │   ├── forms/             # 表单组件
│   │   └── charts/            # 图表组件
│   ├── hooks/                 # 自定义Hooks
│   ├── stores/                # Zustand状态
│   ├── types/                 # TypeScript类型
│   ├── utils/                 # 工具函数
│   ├── pages/                 # 页面组件
│   │   ├── Home.tsx
│   │   ├── Schedule.tsx
│   │   ├── Team.tsx
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 3. 后端技术栈

### 3.1 核心技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 20.x LTS | 运行时 |
| **Express** | 4.x | Web框架 |
| **TypeScript** | 5.x | 类型安全 |
| **PostgreSQL** | 15.x | 主数据库 |
| **Prisma** | 5.x | ORM |
| **Redis** | 7.x | 缓存 |

### 3.2 核心依赖

| 包 | 用途 |
|----|------|
| **bcrypt** | 密码加密 |
| **jsonwebtoken** | JWT认证 |
| **cors** | 跨域处理 |
| **helmet** | 安全头部 |
| **express-rate-limit** | 限流 |
| **multer** | 文件上传 |
| **winston** | 日志 |

### 3.3 项目结构

```
backend/
├── src/
│   ├── config/                # 配置
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── controllers/           # 控制器
│   │   ├── auth.controller.ts
│   │   ├── games.controller.ts
│   │   └── ...
│   ├── middleware/            # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── models/                # 数据模型 (Prisma)
│   ├── routes/                # 路由
│   │   ├── auth.routes.ts
│   │   ├── public.routes.ts   # 公开API
│   │   └── ...
│   ├── services/              # 业务逻辑
│   ├── utils/                 # 工具函数
│   ├── validators/            # 输入验证
│   └── app.ts
├── prisma/
│   └── schema.prisma          # 数据库模型
├── tests/
├── package.json
└── tsconfig.json
```

---

## 4. 数据库设计

### 4.1 实体关系图 (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    teams     │       │    users     │       │    games     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────┤ team_id (FK) │       │ id (PK)      │
│ name         │       │ id (PK)      │       │ home_team_id │◄────┐
│ logo_url     │       │ username     │       │ away_team_id │◄────┼──┐
│ description  │       │ password_hash│       │ scheduled_at │     │  │
│ division     │       │ name         │       │ location     │     │  │
│ created_at   │       │ email        │       │ status       │     │  │
└──────────────┘       │ phone        │       │ created_at   │     │  │
                       │ jersey_number│       └──────────────┘     │  │
                       │ position     │                             │  │
                       │ role         │                             │  │
                       │ is_manual    │                             │  │
                       │ status       │                             │  │
                       │ created_at   │                             │  │
                       └──────────────┘                             │  │
                              │                                     │  │
                              │                                     │  │
       ┌──────────────────────┘                                     │  │
       │                                                            │  │
       ▼                                                            │  │
┌──────────────┐       ┌──────────────┐                            │  │
│game_attendance│      │batting_records│                            │  │
├──────────────┤       ├──────────────┤                            │  │
│ id (PK)      │       │ id (PK)      │                            │  │
│ game_id (FK) │◄──────┤ game_id (FK) │◄───────────────────────────┘  │
│ user_id (FK) │◄──────┤ user_id (FK) │◄──────────────────────────────┘
│ status       │       │ batting_order│
│ created_at   │       │ position     │
└──────────────┘       │ pa_result    │
                       │ inning       │
                       │ created_at   │
                       └──────────────┘

┌──────────────┐
│    videos    │
├──────────────┤
│ id (PK)      │
│ game_id (FK) │◄──────────┐
│ video_url    │            │
│ thumbnail_url│            │
│ duration     │            │
│ created_at   │            │
└──────────────┘            │
                            │
       ┌────────────────────┘
       │
       ▼
┌──────────────┐
│video_highlights
├──────────────┤
│ id (PK)      │
│ video_id (FK)│
│ time         │
│ description  │
└──────────────┘
```

### 4.2 数据表定义

#### users (用户表)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,      -- 登录账号
  password_hash VARCHAR(255) NOT NULL,       -- 密码(bcrypt)
  name VARCHAR(50) NOT NULL,                 -- 姓名
  email VARCHAR(100),                        -- 邮箱
  phone VARCHAR(20),                         -- 手机号
  team_id INTEGER REFERENCES teams(id),      -- 所属球队
  jersey_number INTEGER,                     -- 背号
  position VARCHAR(20),                      -- 位置
  role VARCHAR(20) DEFAULT 'player',         -- 角色
  is_manual_created BOOLEAN DEFAULT true,    -- 是否管理员创建
  status VARCHAR(20) DEFAULT 'active',       -- 账号状态
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### teams (球队表)

```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,                -- 队名
  logo_url VARCHAR(255),                     -- 队徽URL
  description TEXT,                          -- 球队简介
  division VARCHAR(20),                      -- 联盟级别
  captain_id INTEGER REFERENCES users(id),   -- 队长
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### games (比赛表)

```sql
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER REFERENCES teams(id), -- 主队
  away_team_id INTEGER REFERENCES teams(id), -- 客队
  scheduled_at TIMESTAMP NOT NULL,           -- 比赛时间
  location VARCHAR(100),                     -- 场地
  status VARCHAR(20) DEFAULT 'scheduled',    -- 状态
  home_score INTEGER,                        -- 主队得分
  away_score INTEGER,                        -- 客队得分
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### game_attendance (比赛报名表)

```sql
CREATE TABLE game_attendance (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,               -- confirmed/declined
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);
```

#### batting_records (打席记录表)

```sql
CREATE TABLE batting_records (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  batting_order INTEGER NOT NULL,            -- 棒次
  position VARCHAR(10),                      -- 守备位置
  pa_result VARCHAR(20) NOT NULL,            -- 打席结果
  inning INTEGER,                            -- 局数
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### videos (视频表)

```sql
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  video_url VARCHAR(255) NOT NULL,           -- 视频URL
  thumbnail_url VARCHAR(255),                -- 封面URL
  duration INTEGER,                          -- 时长(秒)
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### video_highlights (精彩时刻表)

```sql
CREATE TABLE video_highlights (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  time INTEGER NOT NULL,                     -- 时间点(秒)
  description VARCHAR(255),                  -- 描述
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 索引设计

```sql
-- 用户查询优化
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_username ON users(username);

-- 比赛查询优化
CREATE INDEX idx_games_scheduled ON games(scheduled_at);
CREATE INDEX idx_games_home_team ON games(home_team_id);
CREATE INDEX idx_games_away_team ON games(away_team_id);

-- 报名查询优化
CREATE INDEX idx_attendance_game ON game_attendance(game_id);
CREATE INDEX idx_attendance_user ON game_attendance(user_id);

-- 数据统计优化
CREATE INDEX idx_batting_user ON batting_records(user_id);
CREATE INDEX idx_batting_game ON batting_records(game_id);
```

---

## 5. API设计规范

### 5.1 URL规范

```
# 公开API (无需认证)
GET    /api/public/games
GET    /api/public/standings
GET    /api/public/leaders
GET    /api/public/teams/:id

# 认证API
POST   /api/auth/login
POST   /api/auth/change-password
GET    /api/auth/me

# 需要登录的API
GET    /api/games
GET    /api/games/:id
POST   /api/games/:id/attend
GET    /api/teams/:id/members
GET    /api/games/:id/lineup
GET    /api/stats/me
GET    /api/videos

# 管理员API
POST   /api/admin/teams
POST   /api/admin/users
POST   /api/admin/games
POST   /api/admin/games/:id/batting-records
POST   /api/admin/videos
```

### 5.2 响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "message": "可选的成功提示"
}
```

**列表响应**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数错误",
    "details": [
      { "field": "username", "message": "用户名不能为空" }
    ]
  }
}
```

### 5.3 错误码定义

| 错误码 | HTTP状态 | 说明 |
|--------|----------|------|
| UNAUTHORIZED | 401 | 未登录或Token无效 |
| FORBIDDEN | 403 | 无权访问 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 6. 认证与授权

### 6.1 JWT认证

**Token结构**:
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "sub": "user_id",
    "username": "zhangsan",
    "role": "player",
    "team_id": 1,
    "iat": 1699123456,
    "exp": 1699728256  // 7天过期
  }
}
```

**认证流程**:
1. 用户登录获取Token
2. 前端存储Token (localStorage)
3. 请求时附加Header: `Authorization: Bearer {token}`
4. 后端验证Token有效性

### 6.2 权限控制

| 角色 | 权限 |
|------|------|
| **admin** | 所有权限 |
| **captain** | 管理自己球队，录入比赛数据 |
| **player** | 查看信息，报名比赛 |

---

## 7. 缓存策略

### 7.1 CDN缓存

| 资源 | 缓存时间 | 说明 |
|------|----------|------|
| 静态资源 | 1年 | JS/CSS/图片 |
| 公开API | 5分钟 | 赛程、积分榜 |
| 队徽/头像 | 24小时 | 用户上传图片 |

### 7.2 Redis缓存

| 数据 | 缓存时间 | 说明 |
|------|----------|------|
| 用户Session | 7天 | JWT黑名单 |
| 排行榜 | 5分钟 | 打击率排行等 |
| 频繁查询 | 1分钟 | 减轻数据库压力 |

---

## 8. 部署架构

### 8.1 环境规划

| 环境 | 用途 | 域名 |
|------|------|------|
| **开发** | 本地开发 | localhost:3000/5173 |
| **测试** | 功能测试 | staging.joyful-league.com |
| **生产** | 正式环境 | joyful-league.com |

### 8.2 生产部署

```
用户请求
    │
    ▼
┌─────────────┐
│  CloudFlare │  (DNS + CDN + DDoS防护)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vercel    │  (前端静态托管)
│  (Next.js)  │
└─────────────┘
       │ API请求
       ▼
┌─────────────┐
│   Railway   │  (后端API服务)
│  (Docker)   │
└──────┬──────┘
       │
   ┌───┴───┐
   ▼       ▼
┌─────┐ ┌────────┐
│PGSQL│ │  Redis │
└─────┘ └────────┘
   │
   ▼
┌─────────────┐
│ 阿里云OSS   │  (对象存储)
└─────────────┘
```

### 8.3 部署工具

- **前端**: Vercel (自动部署)
- **后端**: Railway / Render (Docker部署)
- **数据库**: Railway PostgreSQL / Supabase
- **缓存**: Upstash Redis
- **存储**: 阿里云OSS / 腾讯云COS
- **监控**: Sentry (错误监控)

---

## 9. 安全规范

### 9.1 传输安全

- 全站HTTPS
- HSTS头部
- 敏感Cookie设置Secure和HttpOnly

### 9.2 输入安全

- 所有输入参数验证
- SQL注入防护 (使用ORM)
- XSS防护 (输入过滤、输出转义)
- CSRF防护 (JWT天然防护)

### 9.3 访问控制

- API限流 (Rate Limiting)
- 敏感操作日志记录
- 密码强度要求 (最少6位)

---

## 10. 监控与日志

### 10.1 日志记录

```typescript
// 日志级别
logger.info('用户登录', { userId, ip });
logger.warn('登录失败', { username, reason });
logger.error('数据库错误', { error, sql });
```

### 10.2 性能监控

- API响应时间
- 数据库查询时间
- 错误率统计

### 10.3 告警规则

- 错误率 > 1%
- API响应时间 > 2秒
- 数据库连接失败

---

## 相关文档

- [UI/UX Guidelines](./ui-ux-guidelines.md) - UI设计规范
- [App Routing](./app-routing.md) - 应用路由定义

---

**文档结束**
