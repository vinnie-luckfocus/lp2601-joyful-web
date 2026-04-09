---
issue: 14
name: "002: 公开API接口设计"
status: open
created: 2026-04-08T06:14:45Z
updated: 2026-04-08T06:43:22Z
effort: 16h
parallel: true
depends_on: []
---

# 002: 公开API接口设计

## Description

设计并实现4个公开API端点，含错误处理和缓存策略

## Acceptance Criteria

1. GET /api/public/games?limit=4 - 返回近期比赛
2. GET /api/public/standings - 返回球队积分榜
3. GET /api/public/leaders?category=&limit=10 - 返回数据排行榜
4. GET /api/public/recent-games?limit=3 - 返回最近战报
5. 实现HTTP缓存头（Cache-Control: max-age=300）
6. 实现错误处理和降级策略
7. 定义统一API错误响应格式
8. 定义highlights字段数据结构

## Technical Details

- Files: src/routes/public.ts, src/services/publicApi.ts
- 使用Express路由
- 数据库表：games, teams, users, batting_records
- 实现指数退避重试机制
- 统一错误响应格式:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "用户友好错误信息",
      "details": { ... }
    }
  }
  ```
- highlights字段结构定义:
  ```json
  {
    "highlights": [
      { "type": "hr", "player": "球员名", "count": 2, "description": "本垒打 x2" },
      { "type": "rbi", "player": "球员名", "count": 3, "description": "打点 x3" }
    ]
  }
  ```
- 错误码定义:
  - 5001: 数据库连接失败
  - 5002: 查询超时
  - 4001: 无效参数
  - 4041: 数据不存在

## Dependencies

- None

## Definition of Done

- [ ] 4个API端点实现完成
- [ ] 每个端点返回正确的数据结构
- [ ] HTTP缓存头配置正确
- [ ] 错误处理机制覆盖所有异常情况
- [ ] 降级策略在数据库不可用时生效
- [ ] API测试覆盖率80%+
