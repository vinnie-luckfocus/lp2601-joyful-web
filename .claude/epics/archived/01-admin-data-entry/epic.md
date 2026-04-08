---
name: 01-admin-data-entry
status: completed
created: 2026-04-08T03:44:40Z
updated: 2026-04-08T05:57:43Z
progress: 100%
completed_date: 2026-04-08T05:57:43Z
prd: .claude/prds/01-admin-data-entry.md
github: https://github.com/vinnie-luckfocus/lp2601-joyful-web/issues/1
---

# Epic: 01-admin-data-entry

## Overview

管理后台基础框架是 Joyful 棒球联赛网站的 Phase 0 基础设施。本 Epic 负责搭建完整的开发环境，包括数据库设计、后端 API 框架、前端项目初始化以及 Tailwind MLB 主题配置。管理后台将作为所有数据管理功能的统一入口，为后续 Phase 1-2 的功能开发提供基础支撑。

## Architecture Decisions

### 技术栈选择
- **前端框架**: React 18 + TypeScript - 类型安全，组件化开发
- **后端框架**: Node.js + Express - RESTful API，生态成熟
- **数据库**: PostgreSQL - 关系型数据支持，JSON字段灵活性
- **样式方案**: Tailwind CSS - 原子化CSS，快速开发，易于主题定制
- **状态管理**: Zustand - 轻量级，TypeScript友好
- **图标库**: Lucide React - 现代简洁图标

### MLB 主题设计系统
- 主色调: MLB Navy `#041E42` - 导航、标题、深色背景
- 强调色: MLB Red `#BF0D3E` - CTA按钮、高亮状态
- 金色标识: `#C4A35A` - 特殊成就、排名Top3
- 通过 Tailwind config 扩展实现品牌色系统

### 权限设计
- 简化权限模型：仅区分管理员和普通用户
- JWT Token 认证，7天有效期
- 管理员角色通过 users.role 字段控制

## Technical Approach

### Frontend Components

#### 管理后台布局框架
- **Sidebar 组件**: 固定左侧 240px，MLB Navy 背景，红色选中指示器
- **Header 组件**: 顶部导航，用户信息、登出按钮
- **ContentArea 组件**: 可滚动内容区，自适应布局
- **Navigation 组件**: 菜单项配置化，支持图标+文字

#### 通用数据表格
- **DataTable 组件**: 支持排序、分页、行操作
- **FormModal 组件**: 统一表单弹窗，支持验证
- **ImportDialog 组件**: Excel/CSV 导入，进度显示
- **UploadZone 组件**: 拖拽上传，进度条

### Backend Services

#### API 架构
```
/api/admin/*          # 管理员 API（需认证+管理员权限）
/api/auth/*           # 认证 API（公开）
/api/public/*         # 公开 API（无需认证）
```

#### 数据库表结构
```sql
-- 核心表
users                 # 用户表（队员、管理员）
teams                 # 球队表
games                 # 比赛表
game_attendance       # 比赛报名关联表
batting_records       # 打席记录表
videos                # 视频表
video_highlights      # 精彩时刻表
```

#### Admin API Endpoints
```
# 球队管理
POST   /api/admin/teams
PUT    /api/admin/teams/:id
DELETE /api/admin/teams/:id

# 队员管理
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/import

# 赛程管理
POST   /api/admin/games
PUT    /api/admin/games/:id
DELETE /api/admin/games/:id

# 数据录入
POST   /api/admin/games/:id/batting-records
PUT    /api/admin/batting-records/:id

# 视频上传
POST   /api/admin/videos
POST   /api/admin/videos/:id/highlights
```

### Infrastructure

#### 开发环境
- 前端: Vite dev server (port 5173)
- 后端: Node.js + nodemon (port 3001)
- 数据库: PostgreSQL (port 5432)
- 使用 docker-compose 统一编排

#### 文件存储
- 队徽图片: 本地开发使用 public/ 目录，生产使用 OSS/COS
- 视频文件: 生产环境使用对象存储 + CDN

## Implementation Strategy

### Phase 0.1: 数据库设计 (Day 1-2)
- 设计完整的 ER 图
- 编写 SQL migration 文件
- 创建种子数据（2球队 + 18队员 + 4周赛程）

### Phase 0.2: 后端框架 (Day 3-4)
- Express 项目初始化
- 数据库连接配置
- JWT 认证中间件
- 管理员权限中间件
- 基础 API 路由结构

### Phase 0.3: 前端框架 (Day 5-6)
- React + TypeScript + Vite 初始化
- Tailwind CSS 配置 + MLB 主题扩展
- 路由配置（React Router）
- 全局状态管理（Zustand auth store）
- 管理后台布局框架（Sidebar + ContentArea）

### Phase 0.4: 初始数据录入 (Day 7)
- 管理后台基础 CRUD 界面
- 球队/队员/比赛数据录入
- 验证数据完整性

### Risk Mitigation
- **数据库变更**: 使用 migration 管理，支持回滚
- **API 兼容性**: 从 Phase 0 开始定义稳定的 API 契约
- **数据丢失**: 定期备份种子数据脚本

### Testing Approach
- 后端: Jest + Supertest 单元测试
- 前端: Vitest 组件测试
- E2E: 开发环境手动验证数据流

## Task Breakdown Preview

- [ ] **Database**: Design schema and create migration files
- [ ] **Database**: Create seed data (2 teams, 18+ players, 4 weeks schedule)
- [ ] **Backend**: Initialize Express project with TypeScript
- [ ] **Backend**: Setup JWT authentication middleware
- [ ] **Backend**: Setup admin authorization middleware
- [ ] **Frontend**: Initialize React + Vite project
- [ ] **Frontend**: Configure Tailwind CSS with MLB theme colors
- [ ] **Frontend**: Create admin layout (Sidebar + ContentArea)
- [ ] **Frontend**: Implement navigation menu component
- [ ] **Integration**: Connect frontend to backend with sample data

## Dependencies

### External Services
- PostgreSQL 数据库
- 对象存储服务（阿里云OSS/腾讯云COS）- 生产环境

### Internal Dependencies
- 无前置依赖（这是 Phase 0，其他 PRD 依赖此 Epic）

### Prerequisite Work
- 确定最终技术栈版本
- 准备开发环境（Node.js, PostgreSQL, Docker）

## Success Criteria (Technical)

### Performance Benchmarks
- API 响应时间: < 200ms (本地开发)
- 首屏加载时间: < 3s
- 数据库查询: < 100ms

### Quality Gates
- TypeScript 严格模式通过
- ESLint + Prettier 代码规范
- 所有 API 有基本错误处理

### Acceptance Criteria
- [ ] 数据库 migration 可正常执行
- [ ] 后端健康检查接口可用
- [ ] 前端首页可正常访问
- [ ] 管理后台布局框架正常显示
- [ ] Tailwind MLB 主题色配置生效
- [ ] 种子数据可正常导入
- [ ] 至少 2 个球队、每队 9+ 队员、4 周赛程数据完整

## Estimated Effort

- **Overall Timeline**: 1 week (7 days)
- **Resource Requirements**: 1 名全栈开发者
- **Critical Path**: Database → Backend → Frontend → Data Entry

### Daily Breakdown
| Day | Focus | Deliverable |
|:---:|:---|:---|
| 1 | Database Design | ER diagram + migration files |
| 2 | Database Seed | Seed data scripts |
| 3 | Backend Setup | Express + auth middleware |
| 4 | Backend API | Admin API routes structure |
| 5 | Frontend Setup | React + Tailwind + MLB theme |
| 6 | Frontend Layout | Admin layout + navigation |
| 7 | Integration | Data entry + validation |

---

## Tasks Created

| 编号 | 任务 | 并行 | 依赖 | 预计工时 |
|:---:|:---|:---:|:---|:---:|
| [ ] | 001.md - Database Schema Design | ✅ | - | 8h |
| [ ] | 002.md - Database Seed Data | ✅ | - | 6h |
| [ ] | 003.md - Express Project Initialization | ✅ | 001, 002 | 6h |
| [ ] | 004.md - JWT Authentication Middleware | ✅ | 001, 002 | 8h |
| [ ] | 005.md - Admin Authorization Middleware | ✅ | 001, 002 | 6h |
| [ ] | 006.md - React + Vite Project Initialization | ✅ | 003, 004, 005 | 6h |
| [ ] | 007.md - Tailwind MLB Theme Configuration | ✅ | 003, 004, 005 | 4h |
| [ ] | 008.md - Admin Layout Framework | ✅ | 003, 004, 005 | 8h |
| [ ] | 009.md - Navigation Menu Component | ✅ | 006, 007, 008 | 4h |
| [ ] | 010.md - Frontend-Backend Integration | ❌ | 009 | 6h |

**统计信息**:
- 总任务数: 10
- 可并行任务: 9
- 顺序执行: 1
- 预计总工时: 62 小时 (约 8 天)
- 并行优化后: 1 周 (7 天)

**开发阶段**:
- 阶段 1 (Day 1-2): 001, 002 → 数据库
- 阶段 2 (Day 3-4): 003, 004, 005 → 后端
- 阶段 3 (Day 5-6): 006, 007, 008, 009 → 前端
- 阶段 4 (Day 7): 010 → 集成

---

**Next Step**: Ready to sync to GitHub? Run: `/pm:epic-sync 01-admin-data-entry`
