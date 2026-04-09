# CCPM 全自动开发 Skill 设计文档

> 目标：基于给定 PRD 实现端到端自动化开发与验证，全程无需人工介入。

---

## 1. 概述

### 1.1 设计目标
构建一个 Claude Code Skill，能够接收一份完整 PRD，自动完成需求拆解、任务同步、代码开发、测试验证的全流程，最终交付可运行的代码。

### 1.2 核心原则
- **全自动**：从 PRD 输入到代码交付，中间无需人工操作。
- **可验证**：每个 Epic 完成后都有明确的验收标准和自动化测试。
- **可追溯**：每个决策点和执行结果都有日志记录，便于复盘。

---

## 2. 工作流程

### Phase 1: 需求拆解与审核

#### 2.1.1 输入
- 一份完整的 PRD 文档（Markdown 格式，位于 `ccpm/prds/<feature-name>.md`）。

#### 2.1.2 自动拆解
- Skill 读取 PRD 内容。
- 调用 `planner` agent 对 PRD 进行结构化拆解：
  - 拆分为多个 **Epic**，每个 Epic 对应一个相对独立的功能模块。
  - 每个 Epic 下拆分为多个 **Task**（可映射为 GitHub Issue）。
  - 输出 Epic 和 Task 的详细描述、验收标准（Acceptance Criteria）、依赖关系。
- 将拆解结果写入 `ccpm/epics/<epic-name>/` 目录下。

#### 2.1.3 自动审核
- 拆解完成后，调用一个独立的 `auditor` agent（可以是 `architect` 或专门的 review agent）对拆解结果进行审核：
  - 检查 Epic 划分是否合理（高内聚、低耦合）。
  - 检查 Task 是否覆盖了 PRD 中的所有功能点。
  - 检查依赖关系是否正确，是否存在循环依赖。
  - 检查验收标准是否清晰、可测试。
- 审核结果写入 `ccpm/epics/<epic-name>/audit-report.md`。
- **决策逻辑**：
  - 如果审核通过，进入 Phase 2。
  - 如果审核不通过，根据 audit-report 自动修正拆解结果，然后重新审核（最多 N 轮，避免无限循环）。

### Phase 2: 任务同步与开发

#### 2.2.1 Epic 同步到 GitHub
- 对每个 Epic，调用 CCPM 的 `/pm:epic-sync` 命令：
  - 将 Epic 和 Task 同步为 GitHub Issues。
  - 建立 Epic 与 Task 之间的关联（如 GitHub Milestone 或表格映射）。
- 同步完成后，生成 `github-mapping.md` 记录 Issue 编号映射。

#### 2.2.2 按开发计划执行 Epic
- 按照 PRD 中定义的开发顺序（或根据依赖拓扑排序）逐个处理 Epic：
  1. **创建开发环境**：
     - 调用 `/pm:epic-start-worktree <epic-name>` 创建独立的 Git worktree 和 branch。
  2. **Task 分配与并行开发**：
     - 对每个 Epic 下的 Task，调用对应的 agent 进行开发。
     - 若多个 Task 无文件冲突，使用 `parallel-worker` agent 并行开发。
     - 若存在冲突，按顺序串行开发。
  3. **代码提交**：
     - 每个 Task 完成后自动提交，遵循提交规范：`Issue #{number}: {description}`。
  4. **Epic 合并**：
     - Epic 下所有 Task 开发完成后，调用 `/pm:epic-merge <epic-name>` 合并回 main。
  5. **循环处理**：
     - 处理下一个 Epic，直到所有 Epic 完成。

### Phase 3: 验证与交付

#### 2.3.1 测试用例生成
- 每完成一个 Epic，基于该 Epic 的验收标准自动生成测试用例：
  - **单元测试**：覆盖核心函数和组件。
  - **集成测试**：覆盖 API 端点和数据库操作。
  - **E2E 测试**：覆盖该 Epic 引入的关键用户流程。
- 使用 `tdd-guide` agent 确保测试先写后过，或直接使用 `test-runner` agent 验证现有测试。

#### 2.3.2 功能验证
- 调用 `test-runner` agent 运行全部测试：
  - 检查是否实现了 PRD 中的全部功能。
  - 检查代码覆盖率是否达到项目要求（如 80%+）。
- 如果测试失败：
  - 自动分析失败原因（`code-analyzer` 或 `build-error-resolver`）。
  - 自动修复代码并重新运行测试（最多 M 轮）。

#### 2.3.3 系统可靠性检查
- 运行项目级别的验证：
  - 构建检查（`npm run build` 或通过）。
  - 类型检查（TypeScript `tsc --noEmit` 或通过）。
  - 静态代码分析（Linter 通过）。
  - 安全扫描（`security-reviewer` agent）。
- 所有检查通过后，标记该 Epic 为完成。

#### 2.3.4 最终交付
- 所有 Epic 完成后：
  - 生成完整的 `DELIVERY_REPORT.md`，包含：
    - 已完成的 Epic 列表。
    - 关键代码变更摘要。
    - 测试覆盖率和结果。
    - 已知限制或遗留问题。
  - 可选：创建最终的 GitHub Release 或 PR。

---

## 3. Skill 接口设计（初稿）

```markdown
/auto-dev <prd-path>
```

### 参数
- `prd-path`: PRD 文件路径，如 `ccpm/prds/user-authentication.md`。

### 可选参数（待讨论）
- `--max-audit-rounds`: 审核最大迭代次数（默认 2）。
- `--max-fix-rounds`: 测试失败后自动修复最大迭代次数（默认 3）。
- `--parallel-tasks`: 是否允许同一 Epic 下无冲突 Task 并行开发（默认 true）。
- `--dry-run`: 只生成计划，不实际执行开发和同步。

---

## 4. 待讨论与完善的问题

1. **审核 Agent 的选择**：
   - 使用现成 agent（如 `architect`）还是新建一个专门的 `auditor` agent？
   - 审核通过/不通过的判断标准如何量化？

2. **并行开发的冲突检测**：
   - 如何预先判断两个 Task 是否会修改同一文件？
   - 是否需要引入一个前置的 "影响面分析" 步骤？

3. **测试生成策略**：
   - 测试用例是完全由 AI 生成，还是基于 PRD 中的验收标准自动生成模板后填充？
   - E2E 测试的框架和运行环境如何准备？

4. **失败处理与降级策略**：
   - 如果某个 Epic 的测试或合并反复失败，是跳过还是停止整个流程？
   - 是否需要人工介入的 "escalation" 机制？

5. **与现有 CCPM 命令的集成**：
   - 是否需要新增或修改现有的 `/pm:*` 命令以支持本 Skill？
   - 现有的 `epic-start-worktree`、`epic-merge` 是否已满足需求？

6. **日志与可观测性**：
   - 全流程的执行日志保存到哪里？
   - 用户如何实时查看当前进度？

---

## 5. 附录

### 5.1 涉及的 Agent / Skill 清单
| 组件 | 用途 |
|------|------|
| `planner` | PRD 拆解为 Epic/Task |
| `architect` / `auditor` | 拆解结果审核 |
| `/pm:epic-sync` | 同步 Epic 到 GitHub |
| `/pm:epic-start-worktree` | 创建开发分支 |
| `/pm:epic-merge` | 合并 Epic 回 main |
| `parallel-worker` | 并行开发多个 Task |
| `tdd-guide` | 测试驱动开发 |
| `test-runner` | 运行并分析测试 |
| `code-analyzer` | 分析问题根因 |
| `build-error-resolver` | 修复构建错误 |
| `security-reviewer` | 安全扫描 |

### 5.2 目录结构示例
```
ccpm/
├── prds/
│   └── feature-x.md
├── epics/
│   └── feature-x-epic1/
│       ├── epic.md
│       ├── 1.md
│       ├── 2.md
│       ├── audit-report.md
│       └── github-mapping.md
└── skills/
    └── auto-develop-spec.md
```
