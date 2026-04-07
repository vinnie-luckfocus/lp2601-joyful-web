---
name: ui-ux-guidelines
description: Joyful联赛网站全局UI/UX设计规范，包含色彩、动效、组件、响应式设计标准
created: 2026-04-07T15:01:11Z
status: complete
---

# PRD: UI/UX Design Guidelines

## Executive Summary

本文档定义Joyful棒球联赛网站的全局UI/UX设计规范，是所有前端页面和组件设计的参考标准。确保整个产品视觉风格统一、用户体验一致。

---

## 1. 设计原则

### 1.1 核心原则

- **简洁现代**: 界面干净，留白充足，信息层次清晰
- **专业运动感**: 体现棒球运动的活力与团队精神
- **高质感视觉**: 精致的图标、圆角设计、柔和阴影
- **移动优先**: 优先设计移动端体验，再适配桌面端

### 1.2 设计目标

- 让队员能快速找到需要的信息
- 通过动效增强操作反馈
- 通过数据可视化增强成就感
- 建立专业、可信赖的联赛形象

---

## 2. 色彩系统

### 2.1 主色调

| 颜色 | 色值 | 用途 |
|------|------|------|
| **主色深蓝** | `#1a365d` | 主品牌色、导航栏、重要标题 |
| **辅色活力橙** | `#ed8936` | CTA按钮、强调元素、高亮 |
| **背景浅灰白** | `#f7fafc` | 页面背景、卡片背景 |
| **文字深灰** | `#2d3748` | 正文文字、标签 |
| **文字浅灰** | `#718096` | 次要文字、占位符 |

### 2.2 功能色

| 颜色 | 色值 | 用途 |
|------|------|------|
| **成功绿** | `#38a169` | 成功状态、确认按钮、上涨 |
| **警告黄** | `#ecc94b` | 警告提示、待处理状态 |
| **错误红** | `#e53e3e` | 错误提示、删除操作、下跌 |
| **信息蓝** | `#3182ce` | 信息提示、链接 |

### 2.3 色彩使用规范

**主色使用**:
- 导航栏背景: `#1a365d`
- 英雄区渐变: `linear-gradient(135deg, #1a365d 0%, #2c5282 100%)`
- 重要标题: `#1a365d`

**辅色使用**:
- 主要按钮背景: `#ed8936`
- 悬停状态: `#dd6b20` (加深)
- 徽标/标签: `#ed8936`

**背景层次**:
- 页面背景: `#f7fafc`
- 卡片背景: `#ffffff`
- 输入框背景: `#ffffff`
- 禁用背景: `#e2e8f0`

---

## 3. 排版系统

### 3.1 字体

- **中文**: "PingFang SC", "Microsoft YaHei", sans-serif
- **英文/数字**: "Inter", "SF Pro Display", sans-serif
- **备用**: system-ui, -apple-system, sans-serif

### 3.2 字号规范

| 级别 | 大小 | 字重 | 用途 |
|------|------|------|------|
| **Hero标题** | 32-48px | 700 | 首页英雄区大标题 |
| **页面标题** | 24-28px | 600 | 页面顶部标题 |
| **卡片标题** | 18-20px | 600 | 卡片内标题 |
| **正文** | 14-16px | 400 | 正文内容 |
| **辅助文字** | 12-13px | 400 | 标签、说明文字 |
| **数据数字** | 24-36px | 700 | 统计数据展示 |

### 3.3 行高

- 标题: 1.2-1.3
- 正文: 1.5-1.6
- 紧凑排版: 1.4

---

## 4. 间距系统

### 4.1 基础间距

以4px为基准单位:

| 名称 | 值 | 用途 |
|------|-----|------|
| xs | 4px | 图标与文字间距 |
| sm | 8px | 紧凑元素间距 |
| md | 16px | 标准元素间距 |
| lg | 24px | 卡片内边距 |
| xl | 32px | 区块间距 |
| 2xl | 48px | 大区块间距 |
| 3xl | 64px | 页面级间距 |

### 4.2 页面边距

- **移动端**: 16px
- **平板**: 24px
- **桌面**: 32px (最大内容宽度1200px)

### 4.3 组件间距

- 卡片内边距: 16-24px
- 表单元素间距: 16px
- 按钮内边距: 12px 24px (大) / 8px 16px (中)

---

## 5. 组件规范

### 5.1 卡片设计

**基础卡片**:
```css
border-radius: 12-16px;
background: #ffffff;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
padding: 16-24px;
```

**卡片悬停**:
```css
transform: translateY(-2px);
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
transition: all 0.2s ease;
```

**卡片变体**:
- 默认卡片: 白色背景
- 强调卡片: 浅蓝背景 `#ebf8ff`
- 成功卡片: 浅绿背景 `#f0fff4`

### 5.2 按钮设计

**主要按钮 (Primary)**:
```css
background: #ed8936;
color: #ffffff;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
```

**次要按钮 (Secondary)**:
```css
background: transparent;
color: #1a365d;
border: 1px solid #1a365d;
border-radius: 8px;
```

**幽灵按钮 (Ghost)**:
```css
background: transparent;
color: #1a365d;
border: none;
/* 悬停时下划线 */
```

**按钮尺寸**:
- 大: 48px高 (主要操作)
- 中: 40px高 (次要操作)
- 小: 32px高 (辅助操作)

### 5.3 表单设计

**输入框**:
```css
border: 1px solid #e2e8f0;
border-radius: 8px;
padding: 12px 16px;
/* 聚焦时 */
border-color: #3182ce;
box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
```

**标签**:
- 顶部固定标签: 12px, 灰色, 位于输入框上方
- 浮动标签: 输入时缩小并上移

**错误状态**:
- 边框变红 `#e53e3e`
- 下方显示红色错误提示文字
- 左侧显示错误图标

### 5.4 导航设计

**顶部导航栏**:
```css
height: 56-64px;
background: #1a365d;
color: #ffffff;
position: sticky;
top: 0;
z-index: 100;
```

**底部Tab栏 (移动端)**:
```css
height: 56px;
background: #ffffff;
border-top: 1px solid #e2e8f0;
position: fixed;
bottom: 0;
/* 当前选中项高亮主色 */
```

**导航项状态**:
- 默认: 灰色图标+文字
- 选中: 主色图标+文字，可能带徽章

---

## 6. 动效规范

### 6.1 动画时长

| 类型 | 时长 | 用途 |
|------|------|------|
| 微交互 | 100-150ms | 按钮点击、状态切换 |
| 标准过渡 | 200-300ms | 页面转场、悬停效果 |
| 复杂动画 | 400-600ms | 图表绘制、加载动画 |

### 6.2 缓动函数

```css
/* 标准 */
transition-timing-function: ease-in-out;

/* 进入 */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* 退出 */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);

/* 弹性 (用于有趣的效果) */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 6.3 页面转场

**淡入淡出**:
```css
/* 进入 */
opacity: 0 → 1;
duration: 300ms;

/* 可配合轻微上移 */
transform: translateY(10px) → translateY(0);
```

**列表加载 (Stagger)**:
```css
/* 每个项依次进入，间隔100ms */
item-1: delay 0ms
item-2: delay 100ms
item-3: delay 200ms
/* ... */
animation: slideUp 300ms ease-out forwards;
```

### 6.4 交互动效

**按钮悬停**:
```css
/* 上浮+阴影加深 */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3);
```

**按钮点击**:
```css
/* 按下缩小 */
transform: scale(0.98);
duration: 100ms;
```

**卡片悬停**:
```css
transform: translateY(-4px) scale(1.01);
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
```

**输入框聚焦**:
```css
/* 边框颜色过渡 + 阴影 */
border-color: #3182ce;
box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
duration: 200ms;
```

### 6.5 数据可视化动效

**数字计数**:
```javascript
// 数字从0动画增长到目标值
duration: 1000ms;
easing: easeOutExpo;
```

**趋势图绘制**:
```css
/* 线条从左到右绘制 */
stroke-dasharray: 1000;
stroke-dashoffset: 1000 → 0;
duration: 1500ms;
```

**雷达图绘制**:
```css
/* 顶点依次连接 */
/* 每个顶点延迟100ms */
duration: 300ms per vertex;
```

**柱状图增长**:
```css
/* 从底部向上增长 */
transform: scaleY(0) → scaleY(1);
transform-origin: bottom;
duration: 600ms;
stagger: 100ms;
```

### 6.6 加载状态

**骨架屏 (Skeleton)**:
```css
background: linear-gradient(
  90deg,
  #e2e8f0 25%,
  #cbd5e0 50%,
  #e2e8f0 75%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
```

**加载指示器**:
- 使用主色旋转圆环
- 直径: 24-48px (根据场景)
- 线宽: 2-3px

**图片懒加载**:
```css
/* 模糊渐显 */
filter: blur(10px) → blur(0);
opacity: 0 → 1;
duration: 300ms;
```

---

## 7. 响应式设计

### 7.1 断点定义

| 名称 | 范围 | 设备 |
|------|------|------|
| **sm** | < 640px | 手机 |
| **md** | 640px - 768px | 大手机/小平板 |
| **lg** | 768px - 1024px | 平板 |
| **xl** | 1024px - 1280px | 小桌面/大平板 |
| **2xl** | > 1280px | 桌面 |

### 7.2 布局适配

**移动端 (< 640px)**:
- 单列布局
- 底部Tab导航
- 卡片全宽
- 触摸优化的按钮尺寸 (min 44px)

**平板 (640px - 1024px)**:
- 双列布局
- 侧边导航或顶部导航
- 卡片固定宽度，网格排列

**桌面 (> 1024px)**:
- 多列布局
- 固定侧边栏
- 最大内容宽度: 1200px
- 居中对齐

### 7.3 组件响应式

**导航**:
- 移动端: 底部Tab (4-5个入口)
- 桌面端: 顶部水平导航 + 侧边栏

**卡片网格**:
- 移动端: 1列
- 平板: 2列
- 桌面: 3-4列

**表单**:
- 移动端: 垂直堆叠，全宽输入框
- 桌面: 可双列并排，标签右对齐

**战术板**:
- 移动端: 上下布局 (棒次列表在上，布阵图在下)
- 桌面: 左右布局 (棒次列表在左，布阵图在右)

---

## 8. 图标规范

### 8.1 图标库

推荐使用以下图标库:
- **Heroicons** (首选)
- **Lucide React**
- **Phosphor Icons**

### 8.2 图标尺寸

| 用途 | 尺寸 |
|------|------|
| 导航图标 | 24px |
| 按钮图标 | 16-20px |
| 列表图标 | 20px |
| 装饰图标 | 32-48px |

### 8.3 图标颜色

- 默认: 继承文字颜色
- 选中: 主色 `#ed8936`
- 禁用: 灰色 `#a0aec0`

---

## 9. 可访问性 (Accessibility)

### 9.1 色彩对比度

- 正文文字与背景对比度 ≥ 4.5:1
- 大文字 (18px+) 对比度 ≥ 3:1
- 使用 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 验证

### 9.2 触摸目标

- 所有可点击元素最小尺寸: 44x44px
- 相邻可点击元素间距: ≥ 8px

### 9.3 焦点状态

- 键盘导航时显示清晰的焦点环
- 焦点环颜色: `#3182ce`
- 焦点环样式: `outline: 2px solid #3182ce; outline-offset: 2px;`

### 9.4 语义化

- 使用正确的HTML语义标签
- 图片添加有意义的alt文字
- 表单添加label关联

---

## 10. 图片规范

### 10.1 队徽

- **格式**: PNG (透明背景) 或 WebP
- **尺寸**: 推荐 512x512px，最小 256x256px
- **显示尺寸**: 64-128px (根据场景)
- **备用**: 提供默认占位图

### 10.2 用户头像

- **格式**: JPG 或 WebP
- **尺寸**: 256x256px
- **显示尺寸**: 40-64px (列表), 96-128px (个人页)
- **默认头像**: 根据姓名首字母生成

### 10.3 图片处理

- 上传时自动生成多尺寸缩略图
- 使用懒加载优化性能
- 提供模糊占位图提升感知性能

---

## 11. 实施检查清单

在实现每个页面/组件时，确认以下事项:

### 视觉检查
- [ ] 使用正确的色彩系统
- [ ] 遵循间距规范
- [ ] 圆角和阴影一致
- [ ] 字体大小和字重正确

### 动效检查
- [ ] 页面加载有过渡动画
- [ ] 交互有反馈动画
- [ ] 动画时长符合规范
- [ ] 动画性能流畅 (60fps)

### 响应式检查
- [ ] 移动端布局正确
- [ ] 桌面端布局正确
- [ ] 触摸目标尺寸足够
- [ ] 文字在各尺寸可读

### 可访问性检查
- [ ] 色彩对比度达标
- [ ] 键盘可导航
- [ ] 图片有alt文字
- [ ] 语义化HTML结构

---

## 相关文档

- [App Routing](./app-routing.md) - 应用路由和导航结构
- [Tech Architecture](./tech-architecture.md) - 技术栈和实现细节

---

**文档结束**
