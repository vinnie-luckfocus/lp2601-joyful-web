<div align="center">
  <h1>⚾ Joyful Baseball League</h1>
  <p><strong>成人业余棒球联赛管理系统</strong> | 赛前准备与赛后复盘平台</p>

  <p align="center">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/vinnie-luckfocus/lp2601-joyful-web?style=flat-square&color=BF0D3E">
    <img alt="GitHub forks" src="https://img.shields.io/github/forks/vinnie-luckfocus/lp2601-joyful-web?style=flat-square&color=041E42">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/vinnie-luckfocus/lp2601-joyful-web?style=flat-square&color=2D8659">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/vinnie-luckfocus/lp2601-joyful-web?style=flat-square&color=E67E22">
    <img alt="GitHub license" src="https://img.shields.io/github/license/vinnie-luckfocus/lp2601-joyful-web?style=flat-square&color=3182CE">
  </p>

  <p align="center">
    <a href="#-功能特性">功能特性</a> •
    <a href="#-技术栈">技术栈</a> •
    <a href="#-快速开始">快速开始</a> •
    <a href="#-项目结构">项目结构</a> •
    <a href="#-api文档">API文档</a> •
    <a href="#-开发计划">开发计划</a>
  </p>

  <img src="https://raw.githubusercontent.com/vinnie-luckfocus/lp2601-joyful-web/main/assets/cover.png" alt="Joyful Baseball League Cover" width="100%">
</div>

---

## ✨ 功能特性

### 🏠 首页看板（公开访问）
- 📅 **联赛赛程** - 展示未来4周的比赛安排
- 📊 **积分榜** - 各球队战绩排名（胜/负/胜率）
- 🏆 **数据排行榜** - 打击率、安打数、本垒打、打点 Top 10
- 📰 **最近战报** - 最近3场比赛的比分和简要数据

### 👥 球队管理
- 🏷️ **球队信息** - 队名、队徽、简介、联盟级别、赛季战绩
- 👤 **队员列表** - 查看球队成员
- 📋 **战术板** - 位置安排、棒次安排、战术说明、布阵图

### 🎬 视频回放
- 📤 **录像上传** - 支持 MP4 格式
- ▶️ **视频播放** - 播放、暂停、进度条、倍速控制
- ⭐ **精彩时刻标记** - 标记时间点并添加描述

### 📈 数据统计
- ✏️ **打席记录** - 管理员录入比赛数据
- 📊 **个人数据** - 出赛场次、打席数、安打数、打击率、打点、得分
- 📉 **趋势分析** - 近5场打击率变化曲线

### 🔐 权限管理
- 👨‍💼 **管理员** - 球队管理、数据录入、视频上传
- 👤 **队员** - 查看赛程战术、报名参赛、查看个人数据

---

## 🛠️ 技术栈

<div align="center">

### 前端
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.1.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4.5.0-764ABC?style=flat-square)
![React Router](https://img.shields.io/badge/React_Router-6.22.0-CA4245?style=flat-square&logo=reactrouter&logoColor=white)

### 后端
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?style=flat-square)

### 测试
![Jest](https://img.shields.io/badge/Jest-30.3.0-C21325?style=flat-square&logo=jest&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1.3-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-API_Testing-333333?style=flat-square)

</div>

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 15+
- npm 或 yarn

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/vinnie-luckfocus/lp2601-joyful-web.git
cd lp2601-joyful-web
```

2. **安装依赖**

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. **配置数据库**

```bash
# 创建数据库并运行迁移
cd ../database
psql -U postgres -f migrations/001_initial_schema.sql

# 导入种子数据
npm run seed
```

4. **配置环境变量**

```bash
# 后端环境配置
cd ../backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息
```

5. **启动开发服务器**

```bash
# 启动后端（端口 3001）
cd backend
npm run dev

# 新开终端，启动前端（端口 3000）
cd frontend
npm run dev
```

6. **访问应用**

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- 默认管理员账号: `admin@joyful.com` / `admin123`

---

## 📁 项目结构

```
lp2601-joyful-web/
├── 📁 backend/                 # 后端 API
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   ├── middleware/        # 中间件 (auth, admin)
│   │   ├── routes/            # API 路由
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── utils/             # 工具函数
│   │   ├── __tests__/         # 测试文件
│   │   ├── app.ts             # Express 应用
│   │   └── index.ts           # 入口文件
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 frontend/                # 前端应用
│   ├── src/
│   │   ├── components/        # 组件 (Layout, Navigation, UI)
│   │   ├── pages/             # 页面组件
│   │   ├── stores/            # Zustand 状态管理
│   │   ├── utils/             # 工具函数
│   │   ├── __tests__/         # 测试文件
│   │   ├── config/            # 配置文件
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js     # Tailwind 主题配置
│
├── 📁 database/                # 数据库
│   ├── migrations/            # 数据库迁移文件
│   ├── seeds/                 # 种子数据
│   └── schema.md              # 数据库文档
│
├── 📁 tests/                   # 集成测试
│   ├── backend/               # 后端测试
│   ├── frontend/              # 前端测试
│   └── integration/           # 集成测试
│
├── 📁 .claude/                 # 项目管理文档
│   └── epics/                 # Epic 任务文档
│
├── package.json
└── README.md
```

---

## 📚 API 文档

### 认证相关

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/auth/login` | 用户登录 |
| `POST` | `/api/auth/logout` | 用户登出 |
| `GET` | `/api/auth/me` | 获取当前用户信息 |

### 管理员 API（需认证 + 管理员权限）

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/admin/teams` | 获取所有球队 |
| `POST` | `/api/admin/teams` | 创建球队 |
| `PUT` | `/api/admin/teams/:id` | 更新球队 |
| `DELETE` | `/api/admin/teams/:id` | 删除球队 |
| `POST` | `/api/admin/users` | 创建用户 |
| `PUT` | `/api/admin/users/:id` | 更新用户 |
| `DELETE` | `/api/admin/users/:id` | 删除用户 |
| `POST` | `/api/admin/games` | 创建比赛 |
| `PUT` | `/api/admin/games/:id` | 更新比赛 |

---

## 🧪 测试

```bash
# 运行后端测试
cd backend
npm test

# 运行前端测试
cd ../frontend
npm test

# 运行测试覆盖率检查
npm run test:coverage
```

---

## 🎨 设计系统

### MLB 主题色彩

| 类型 | 色值 | 用途 |
|------|------|------|
| **主色调（MLB海军蓝）** | `#041E42` | 导航栏、主标题 |
| **强调色（MLB红）** | `#BF0D3E` | CTA按钮、重要标记 |
| **金色** | `#C4A35A` | 冠军标识、Top3 |
| **成功绿** | `#2D8659` | 已报名状态 |
| **警告橙** | `#E67E22` | 进行中状态 |

---

## 📅 开发计划

### ✅ Phase 0: 管理后台基础框架 (已完成)
- [x] 数据库设计与种子数据
- [x] Express + TypeScript 后端框架
- [x] JWT 认证与管理员权限
- [x] React + Vite 前端项目
- [x] Tailwind MLB 主题配置
- [x] 管理后台布局框架

### 🔄 Phase 1: 首页仪表盘与会员系统 (进行中)
- [ ] 首页看板（赛程、积分榜、排行榜）
- [ ] 会员注册与登录系统
- [ ] 个人中心与数据展示

### 📋 Phase 2: 数据录入与视频系统 (计划中)
- [ ] 比赛数据录入界面
- [ ] 视频上传与播放
- [ ] 精彩时刻标记功能

### 📊 Phase 3: 战术板与统计 (计划中)
- [ ] 可视化战术板
- [ ] 高级数据统计
- [ ] 数据导出功能

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证

---

<div align="center">

**⚾ Joyful Baseball League - 让每一场比赛都值得记录**

Made with ❤️ for baseball enthusiasts

</div>
