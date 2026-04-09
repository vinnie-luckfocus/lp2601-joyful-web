# CCPM 全自动开发 Skill 设计文档

> 目标：接收一份总需求，通过 CCPM 命令实现端到端自动化拆解、开发与验证，全程无需人工介入。

---

## 1. 概述

### 1.1 设计目标
构建一个 Claude Code Skill，能够接收用户的**总需求**（一份高层级的产品需求描述），自动完成：
1. 将总需求拆解为多个编号规范的 **PRD**；
2. 通过 CCPM 命令将每个 PRD 解析并拆解为 **Epic/Task**；
3. 按顺序逐个 Epic 进行开发、测试验证与合并交付。

### 1.2 核心原则
- **全自动**：从总需求输入到代码交付，中间无需人工操作。
- **CCPM 优先**：所有拆解、同步、开发、验证动作优先调用 CCPM 既有命令 `/pm:*`。
- **可验证**：每个 Epic 完成后都有明确的验收标准和自动化测试。
- **可追溯**：每个决策点和执行结果都有日志记录，便于复盘。

---

## 2. 命名规范

### 2.1 PRD 命名规范
所有生成的 PRD 文件必须按整体实现顺序编号：

```
ccpm/prds/
├── 00-<project>-overview.md      # 总需求概述与项目目录（可选）
├── 01-<feature-a>.md             # 第一个实现的特性
├── 02-<feature-b>.md             # 第二个实现的特性
├── 03-<feature-c>.md             # 第三个实现的特性
└── 99-<project>-summary.md       # 汇总与交付报告（最终生成）
```

**编号规则：**
- 使用两位数字前缀 `01`、`02`、`03`...，不足补零。
- 名称使用小写英文单词，用连字符 `-` 分隔。
- 前后顺序必须反映真实依赖关系：前置功能必须先完成，后续功能才能开发。

### 2.2 Epic 命名规范
每个 PRD 解析后生成的 Epic 目录命名：

```
ccpm/epics/
├── 01-<feature-a>/
│   ├── epic.md                   # Epic 主文档
│   ├── 1.md                      # Task 1
│   ├── 2.md                      # Task 2
│   └── github-mapping.md         # GitHub Issue 映射
├── 02-<feature-b>/
│   └── ...
```

**规则：**
- Epic 目录名与对应 PRD 的文件名（去掉 `.md`）保持一致。
- Task 文件编号与实际 CCPM 行为一致：
  - 初始拆解时生成 `001.md`、`002.md`、`003.md` 等。
  - 调用 `/pm:epic-sync` 同步到 GitHub 后，文件会按 GitHub Issue 编号重命名（如 `42.md`、`43.md`）。

---

## 3. 工作流程

### 前置检查（Pre-flight）
在 `/auto-dev` 或 `/auto-resume` 开始执行前，Skill 必须先验证以下环境条件：
- **GitHub CLI 认证**：`gh auth status` 必须已通过。
- **仓库远程地址**：`git remote get-url origin` 必须有效，且不能是 CCPM 模板仓库（`automazeio/ccpm`）。
- **目录结构**：`ccpm/prds/` 和 `ccpm/epics/` 目录必须存在（不存在则自动创建）。
- **工具链可用性**：Node.js、npm（或项目需要的运行时）必须已安装。
- 任一检查失败，输出明确的错误信息和修复命令，并停止执行。

### Phase 1: 总需求 → PRD → Epic 拆解与审核

#### 3.1.1 输入
- 用户提供的总需求描述（可以是自然语言描述，或一份总需求 Markdown 文件）。

#### 3.1.2 总需求拆解为 PRD
- Skill 读取总需求，调用 `planner` agent 分析：
  - 需要实现哪些核心功能模块。
  - 各模块之间的依赖顺序。
  - 每个模块对应的验收标准。
- 根据分析结果，按顺序生成多个 PRD 文件到 `ccpm/prds/`：
  - 使用 `/pm:prd-new <feature-name>` 命令逐个创建 PRD。
  - PRD 文件名遵循命名规范（如 `01-user-authentication.md`）。
  - 若 `/pm:prd-new` 不支持批量创建，则由 Skill 直接写入规范命名的 PRD 文件，再补充到 CCPM 系统中。

#### 3.1.3 PRD 解析为 Epic
- 对每个 PRD，调用 CCPM 命令进行解析和拆解：
  1. `/pm:prd-parse <feature-name>` — 将 PRD 解析为 Epic 结构草稿。
  2. `/pm:epic-decompose <epic-path>` 或 `/pm:epic-oneshot <epic-name>` — 将 Epic 拆解为可执行的 Task（GitHub Issue 粒度）。
- 拆解结果写入 `ccpm/epics/<NN-feature-name>/` 目录。

#### 3.1.4 自动审核
- 拆解完成后，调用 `architect` agent 对拆解结果进行审核：
  - 检查 Epic 划分是否合理（高内聚、低耦合）。
  - 检查 Task 是否覆盖了 PRD 中的所有功能点。
  - 检查 PRD 之间的依赖顺序是否与编号顺序一致。
  - 检查验收标准是否清晰、可测试。
- 审核结果写入 `ccpm/epics/<NN-feature-name>/audit-report.md`。
- **决策逻辑**：
  - 如果审核通过，进入 Phase 2。
  - 如果审核不通过，根据 audit-report 自动修正对应 PRD 或 Epic（最多 N 轮），修正后重新执行 `/pm:epic-decompose` 或 `/pm:epic-oneshot` 并再次审核。

### Phase 2: 任务同步与开发

#### 3.2.1 Epic 同步到 GitHub
- 对每个 Epic，调用 CCPM 命令 `/pm:epic-sync <epic-name>`：
  - 将 Epic 和 Task 同步为 GitHub Issues。
  - 建立 Epic 与 Task 之间的关联。
- 同步完成后，`github-mapping.md` 由 CCPM 命令自动生成或更新。

#### 3.2.2 按开发计划执行 Epic
严格按照 PRD 编号顺序（`01` → `02` → `03`...）逐个处理 Epic：

1. **启动 Epic 开发环境**：
   ```markdown
   /pm:epic-start <NN-feature-name>
   ```
   - 创建独立的 Git worktree 和 `epic/<NN-feature-name>` 分支。
   - 注意：`/pm:epic-start` 可能会为该 Epic 下所有已准备好的 Task 启动并行 agent。Skill 需要等待所有 Task 开发完成后再进入合并步骤。

2. **Task 开发**：
   - 读取当前 Epic 下的所有 Task。
   - 对每个未生成分析文件的 Task，先调用 `/pm:issue-analyze <task-number>` 生成分析文档。
   - 然后调用 `/pm:issue-start <task-number>` 开始开发。
   - 通过调用对应 agent（如 `parallel-worker`、`tdd-guide` 等）完成代码编写。
   - 每个 Task 完成后执行本地 commit，格式：`Issue #{number}: {description}`。

3. **Epic 合并**：
   - 当前 Epic 下所有 Task 开发并提交完成后，返回 main worktree。
   - **默认行为**：在调用 `/pm:epic-merge <NN-feature-name>` 之前暂停并输出合并摘要，等待用户确认（除非传入 `--auto-merge` 参数）。
   - 如果合并发生冲突，停止整个流程，输出冲突详情和解决建议，等待人工介入。

4. **循环处理**：
   - 调用 `/pm:status` 查看下一个待处理 Epic。
   - 重复步骤 1~3，直到所有 Epic 完成。

### Phase 3: 验证与交付

#### 3.3.1 Epic 级验证
每完成一个 Epic 的合并后，必须执行验证：
1. **测试生成**：基于该 Epic 的验收标准自动生成测试用例：
   - **单元测试**：覆盖核心函数和组件（使用 `tdd-guide` agent）。
   - **集成测试**：覆盖 API 端点和数据库操作。
   - **E2E 测试**：覆盖该 Epic 引入的关键用户流程（使用 `e2e-runner` agent）。
2. **测试执行**：调用 `test-runner` agent 运行全部测试，分析结果：
   - 检查代码覆盖率是否达到项目要求（80%+）。
   - 如果测试失败：调用 `code-reviewer` 或 `build-error-resolver` 分析原因，自动修复代码并重新运行测试（最多 M 轮）。
   - 如果 M 轮后仍失败，**停止整个流程**，输出失败报告，等待人工介入。
3. **快速回归检查**：运行项目基础构建命令（如 `npm run build`、`npm run test:unit`）确保合并到 `main` 后没有引入回归问题。

#### 3.3.2 系统级可靠性检查
所有 Epic 完成后，运行项目级验证：
- 构建检查：`npm run build` 或通过等效命令。
- 类型检查：`tsc --noEmit` 或通过等效命令。
- 静态代码分析：Linter（如 `eslint`、`biome`）通过。
- 全流程测试：运行完整的集成测试和 E2E 测试套件。
- 安全扫描：`security-reviewer` agent。

#### 3.3.3 最终交付
- 所有检查通过后，生成 `ccpm/prds/99-<project>-summary.md`：
  - 已完成的 PRD/Epic 列表。
  - 关键代码变更摘要。
  - 测试覆盖率和结果。
  - 已知限制或遗留问题。
- 调用 `/pm:epic-close <NN-feature-name>` 关闭已完成的 Epic（如适用）。
- 可选：创建最终的 GitHub Release 或 PR。

---

## 4. Skill 接口设计

```markdown
/auto-dev <requirement>
```

### 参数
- `requirement`: 总需求描述或总需求文件路径。可以是自然语言文本，也可以是一份 Markdown 文件（如 `requirements/project-x.md`）。

### 可选参数
- `--max-audit-rounds`: 审核最大迭代次数（默认 2）。
- `--max-fix-rounds`: 测试失败后自动修复最大迭代次数（默认 3）。
- `--auto-merge`: 开启全自动模式，Epic 合并前不经过人工确认（默认关闭，每次合并前会暂停等待确认）。
- `--dry-run`: 只生成 PRD 和 Epic 拆解计划，不实际执行开发、同步和合并。

---

## 5. 待讨论与完善的问题

1. **总需求到 PRD 的粒度控制**：
   - 一个总需求应该拆成几个 PRD？按模块拆还是按用户故事拆？
   - 是否需要设置 PRD 的最大/最小粒度标准？

2. **CCPM 命令的覆盖范围**：
   - `/pm:epic-oneshot` 与 `/pm:epic-decompose` 在实际使用中的区别和优先级？
   - `/pm:validate` 仅验证目录结构完整性。是否需要新增一个 `/pm:epic-validate` 命令来专门执行 Epic 级构建/测试验证？

3. **自动审核的通过标准量化**：
   - 如何通过结构化输出让 `architect` agent 的审核结果可被程序自动化解析（通过/不通过）？
   - 是否需要引入 check-list 形式的强制通过项？

4. **失败处理与降级策略**：
   - 当前方案为：合并冲突或 M 轮测试修复失败后，立即停止流程。escalation 报告应输出到哪个位置（终端 / `ccpm/logs/` / 状态文件）才最便于用户排查？
   - 是否需要提供 `--skip-epic` 参数，允许用户在明确风险后强制跳过某个阻塞 Epic？

5. **跨 Epic 的依赖与冲突**：
   - 如果 `02-feature` 的开发需要修改 `01-feature` 已合并的代码，如何检测并处理这种回归修改？
   - 是否需要为每个 Epic 预留 "兼容性测试" 步骤？

6. **日志与可观测性**：
   - 全流程的执行日志保存到 `ccpm/logs/` 还是直接输出到终端？
   - 用户如何实时查看当前进度？是否需要在每个 Phase 结束后输出状态摘要？

---

## 6. Resume Skill 设计（续接开发）

> 区别于 `/auto-dev` 从总需求开始拆解，`/auto-resume` 用于 PRD 已拆解完毕、但部分 Epic 尚未开发完成的场景。该 Skill 自动扫描当前进度，识别剩余工作，并继续执行开发与验证。

### 6.1 使用场景
- 项目已经存在 `ccpm/prds/` 和 `ccpm/epics/` 目录。
- 部分 PRD 对应的 Epic 已经开发并合并到 `main`。
- 还有一部分 PRD/Epic 处于 `backlog`、`open` 或 `in-progress` 状态，需要继续完成。

### 6.2 Skill 接口设计

```markdown
/auto-resume
```

### 可选参数
- `--from <NN-feature-name>`: 指定从某个 PRD/Epic 开始继续（默认自动检测第一个未完成的）。
- `--max-fix-rounds`: 测试失败后自动修复最大迭代次数（默认 3）。
- `--auto-merge`: 开启全自动模式，Epic 合并前不经过人工确认（默认关闭）。
- `--dry-run`: 只扫描并输出剩余工作计划，不实际执行开发。

### 6.3 工作流程

#### 6.3.1 状态扫描
Skill 维护一个状态文件 `ccpm/auto-dev-state.json`，记录当前所在 Phase、正在处理的 PRD/Epic、剩余 retry 次数等信息。无论 `/auto-dev` 还是 `/auto-resume`，都依赖该文件实现中断恢复：

1. **读取状态文件**：
   - 如果存在 `ccpm/auto-dev-state.json`，优先从中读取上次中断的位置。
2. **扫描 PRD 列表**：
   - 读取 `ccpm/prds/` 下所有符合命名规范的 PRD 文件（`01-` ~ `98-`）。
2. **获取开发状态**：
   - 调用 `/pm:status` 获取全局项目状态。
   - 对每个 PRD 调用 `/pm:prd-status <feature-name>`（如支持）确认其状态。
   - 对每个 Epic 调用 `/pm:epic-status <epic-name>`（如支持）确认是否已完成。
3. **状态推断（命令不可用时 fallback）**：
   - 检查 `ccpm/epics/<NN-feature-name>/epic.md` 的 frontmatter 中 `status` 字段。
   - 检查是否存在对应 GitHub Issue 的 closed 状态（通过 `github-mapping.md` 中的 issue 编号调用 `gh issue view`）。
   - 检查 Git 分支/提交历史：是否存在该 Epic 的合并提交或已删除的 `epic/<NN-feature-name>` 分支。
4. **生成剩余工作清单**：
   - 输出如：`剩余 3 个 Epic 待开发：02-homepage-dashboard、03-game-schedule、04-team-management`。

#### 6.3.2 剩余需求开发（复用 Phase 2 逻辑）
对剩余未完成的 PRD/Epic，严格按照编号顺序逐个处理：

1. **同步检查**：
   - 如果该 Epic 尚未同步到 GitHub，调用 `/pm:epic-sync <NN-feature-name>`。
2. **启动开发环境**：
   ```markdown
   /pm:epic-start <NN-feature-name>
   ```
3. **Task 开发**：
   - 对每个未生成分析文件的 Task，先调用 `/pm:issue-analyze <task-number>` 生成分析文档。
   - 然后调用 `/pm:issue-start <task-number>` 开始开发。
   - 调用 agent 完成代码编写。
   - 每个 Task 完成后 `git commit -m "Issue #{number}: {description}"`。
4. **Epic 合并**：
   - 默认在调用 `/pm:epic-merge <NN-feature-name>` 前暂停并输出摘要，等待用户确认（除非传入 `--auto-merge`）。
   - 如果合并冲突，停止流程并等待人工介入。
5. **循环处理**：
   - 继续下一个未完成的 Epic，直到全部完成。

#### 6.3.3 验证与交付（复用 Phase 3 逻辑）
每完成一个 Epic 的合并后，执行与 `/auto-dev` 相同的验证流程：
1. Epic 级测试生成与运行（`tdd-guide`、`test-runner`）。
2. 失败时自动修复（`code-reviewer`、`build-error-resolver`）。
3. 所有 Epic 完成后，运行系统级可靠性检查（构建、类型、Linter、安全扫描）。
4. 生成或更新 `ccpm/prds/99-<project>-summary.md` 交付报告。
5. 调用 `/pm:epic-close <NN-feature-name>` 关闭已完成的 Epic。

### 6.4 状态判断逻辑详细说明

| 检查项 | 已完成标志 | 未完成标志 |
|--------|-----------|-----------|
| Epic frontmatter | `status: completed` 或 `closed` | `status: backlog` / `in-progress` / `open` |
| GitHub Issue | `state: CLOSED` | `state: OPEN` |
| Git 分支 | `epic/<name>` 已合并并删除 | 分支仍存在 / 无合并记录 |
| 代码存在性 | `main` 分支包含该 Epic 的核心文件 | 核心文件缺失 |

**判定规则：**
- 只要 Epic 的 frontmatter 或 GitHub Issue 任一标志为完成，且 `main` 分支存在对应代码变更，即视为已完成。
- 若状态冲突（如 frontmatter 显示完成但代码不存在），输出 ⚠️ 警告并标记为“需要人工确认”，默认跳过该 Epic，继续处理下一个。

---

## 7. 附录

### 7.1 CCPM 命令使用清单
| 命令 | 用途 |
|------|------|
| `/pm:prd-new <feature>` | 创建新 PRD |
| `/pm:prd-parse <feature-name>` | 解析 PRD 为 Epic 结构 |
| `/pm:prd-edit <feature-name>` | 修正 PRD 内容（审核不通过时使用） |
| `/pm:prd-status <feature-name>` | 查看 PRD 状态（如可用） |
| `/pm:epic-decompose <epic-path>` | 将 Epic 拆解为 Task |
| `/pm:epic-oneshot <epic-name>` | 一键创建并分解 Epic |
| `/pm:epic-sync <name>` | 同步 Epic 到 GitHub |
| `/pm:epic-start <name>` | 创建 Epic 开发 worktree |
| `/pm:epic-status <name>` | 查看 Epic 状态（如可用） |
| `/pm:issue-analyze <number>` | 分析 Task 并生成分析文档 |
| `/pm:issue-start <number>` | 开始开发某个 Task |
| `/pm:issue-sync <number>` | 同步 Task 到 GitHub |
| `/pm:epic-merge <name>` | 合并 Epic 回 main |
| `/pm:epic-close <name>` | 关闭已完成 Epic |
| `/pm:status` | 查看当前开发状态 |
| `/pm:validate` | 验证项目目录结构完整性 |

### 7.2 辅助 Agent 清单
| Agent | 用途 |
|------|------|
| `planner` | 总需求分析、PRD 拆分规划 |
| `architect` | 拆解结果审核 |
| `tdd-guide` | 测试驱动开发 |
| `test-runner` | 运行并分析测试 |
| `code-reviewer` | 代码审查与问题根因分析 |
| `build-error-resolver` | 修复构建错误 |
| `security-reviewer` | 安全扫描 |
| `e2e-runner` | E2E 测试执行 |

### 7.3 目录结构示例
```
ccpm/
├── prds/
│   ├── 00-project-overview.md
│   ├── 01-user-authentication.md
│   ├── 02-homepage-dashboard.md
│   ├── 03-game-schedule.md
│   └── 99-project-summary.md
├── epics/
│   ├── 01-user-authentication/
│   │   ├── epic.md
│   │   ├── 001.md          # 初始 Task（同步后重命名为 GitHub Issue ID）
│   │   ├── 002.md
│   │   ├── audit-report.md
│   │   └── github-mapping.md
│   ├── 02-homepage-dashboard/
│   │   └── ...
│   └── 03-game-schedule/
│       └── ...
├── skills/
│   └── auto-develop-spec.md
├── logs/
│   └── auto-dev-2024-01-15.log
└── auto-dev-state.json     # 状态跟踪文件
```
