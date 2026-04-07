---
name: user-authentication
description: 用户认证系统，支持管理员分配账号登录，为后续会员系统预留扩展
created: 2026-04-07T15:01:11Z
status: backlog
phase: 1
---

# PRD: User Authentication

## Executive Summary

用户认证系统是 Joyful 联赛网站的安全入口。第一阶段采用管理员分配账号的模式，快速上线；第二阶段升级为完整会员系统，支持自主注册。

## Problem Statement

- **问题**：需要区分公开信息和私密数据，保护队员个人信息和战术安排
- **重要性**：确保只有 league 成员能访问敏感信息，同时为后续功能扩展打基础

## User Stories

### 故事1：队员登录
**作为** 已分配账号的队员
**我希望** 使用用户名和密码登录系统
**从而** 查看我的球队战术和个人数据

**验收标准**：
- [ ] 能使用分配的用户名/密码登录
- [ ] 登录成功后跳转到个人相关页面
- [ ] 登录状态持久化（JWT token）
- [ ] 错误登录有友好提示

### 故事2：首次登录修改密码
**作为** 首次登录的队员
**我希望** 修改初始密码
**从而** 保证账号安全

**验收标准**：
- [ ] 首次登录强制修改密码
- [ ] 新密码需符合安全要求（6位以上）
- [ ] 修改成功后重新登录

## Requirements

### Functional Requirements

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 登录弹窗 | 从首页点击登录弹出模态框 | P0 |
| JWT认证 | 颁发和验证JWT token | P0 |
| 密码修改 | 首次登录强制修改初始密码 | P0 |
| 登录状态 | 全局状态管理，保持登录态 | P0 |
| 登出功能 | 用户主动登出 | P1 |
| 权限控制 | 区分公开路由和需要登录的路由 | P0 |

### API Requirements

```
POST /api/auth/login
Request: { username, password }
Response: { token, user: { id, name, team_id, role } }
Error: 401 用户名或密码错误

POST /api/auth/change-password
Headers: Authorization: Bearer {token}
Request: { old_password, new_password }
Response: { success: true }

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { id, name, team_id, jersey_number, position, role }
```

### Non-Functional Requirements

| 类型 | 要求 |
| :--- | :--- |
| 安全 | 密码bcrypt加密，JWT有过期时间（7天） |
| 性能 | 登录接口响应 < 500ms |
| 体验 | 登录弹窗动画流畅，错误提示明确 |

## Success Criteria

| 指标 | 目标值 | 测量方式 |
| :--- | :--- | :--- |
| 登录成功率 | > 95% | 日志统计 |
| 平均登录时间 | < 10秒 | 埋点统计 |
| Token刷新 | 无感知 | 用户反馈 |

## Constraints & Assumptions

- 第一阶段不支持密码找回（联系管理员重置）
- 第一阶段不支持多设备同时登录限制
- 用户名由管理员统一分配，不支持自定义

## Out of Scope

- 自主注册（在会员系统PRD中）
- 密码找回邮件/短信
- 第三方登录（微信/手机号）
- 双因素认证

## Dependencies

- 依赖 users 数据表（管理员已录入数据）
- 依赖 JWT 库和 bcrypt 加密库
- 依赖前端全局状态管理（Zustand/Context）
