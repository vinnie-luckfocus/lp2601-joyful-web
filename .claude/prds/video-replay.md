---
name: video-replay
description: 比赛视频上传、存储和回放，支持精彩时刻标记
created: 2026-04-07T15:01:11Z
status: backlog
---

# PRD: Video Replay

## Executive Summary

视频回放功能允许管理员上传比赛录像，队员可以随时回看比赛过程。支持精彩时刻标记，方便快速定位关键画面，是赛后复盘的重要工具。

## Problem Statement

- **问题**：比赛结束后没有录像回顾，无法复盘关键时刻，错失的战术细节无法重现
- **重要性**：提供赛后学习机会，记录精彩瞬间，增加联赛专业感

## User Stories

### 故事1：上传比赛视频
**作为** 管理员
**我希望** 方便地上传比赛录像
**从而** 让队员可以回看

**验收标准**：
- [ ] 支持拖拽上传
- [ ] 显示上传进度
- [ ] 支持断点续传
- [ ] 上传后自动转码（如需要）

### 故事2：观看比赛录像
**作为** 队员
**我希望** 回看整场比赛
**从而** 复盘自己的表现

**验收标准**：
- [ ] 流畅播放视频
- [ ] 支持播放控制（播放/暂停/进度条/倍速）
- [ ] 清晰画质（720p）

### 故事3：查看精彩时刻
**作为** 队员
**我希望** 快速跳转到精彩瞬间
**从而** 不用看完整场比赛

**验收标准**：
- [ ] 显示精彩时刻时间轴
- [ ] 点击跳转到对应时间点
- [ ] 支持文字描述（如"张三本垒打"）

## Requirements

### Functional Requirements

| 功能 | 描述 | 优先级 |
| :--- | :--- | :--- |
| 视频上传 | 拖拽上传，进度显示 | P0 |
| 视频列表 | 按比赛日期展示录像 | P0 |
| 视频播放 | 基础播放控制 | P0 |
| 精彩时刻 | 时间轴标记+跳转 | P1 |
| 视频删除 | 管理员可删除 | P1 |
| 封面图 | 自动截取或上传封面 | P2 |

### API Requirements

```
# 视频上传
POST /api/videos/upload
Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
Body: { game_id, video_file }
Response: { video_id, upload_url, progress_url }

# 视频列表
GET /api/videos?limit=20
Response: [{
  id, game_id, game_date, home_team, away_team,
  thumbnail_url, video_url, duration, highlights_count
}]

# 视频详情
GET /api/videos/:id
Response: {
  id, game, video_url, duration,
  highlights: [{ time, description }]
}

# 添加精彩时刻
POST /api/videos/:id/highlights
Request: { time, description }
```

### Non-Functional Requirements

| 类型 | 要求 |
| :--- | :--- |
| 存储 | 使用对象存储（OSS/COS），CDN加速 |
| 格式 | 支持MP4，建议H.264编码 |
| 画质 | 720p，码率2-4Mbps |
| 加载 | 首屏加载 < 3秒 |

## Success Criteria

| 指标 | 目标值 | 测量方式 |
| :--- | :--- | :--- |
| 上传成功率 | > 95% | 日志统计 |
| 播放流畅率 | > 98%无卡顿 | 用户反馈 |
| 视频覆盖率 | 80%比赛有录像 | 后台统计 |

## Constraints & Assumptions

- 视频由管理员统一上传，队员不能上传
- 视频存储成本由俱乐部承担
- 视频保留时间暂不设限（后续可设置归档策略）

## Out of Scope

- 实时直播功能
- 自动剪辑/AI分析
- 视频编辑功能
- 弹幕/评论功能
- 多机位切换

## Dependencies

- 依赖对象存储服务（阿里云OSS/腾讯云COS）
- 依赖CDN加速
- 依赖视频播放器组件
- 依赖 games 数据表
