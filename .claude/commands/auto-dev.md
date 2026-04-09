---
allowed-tools: Bash, Read, Write, Edit, LS, Task, Agent
---

# Auto Dev

全自动从总需求开始拆解、开发、验证并交付。接收总需求描述或文件路径，执行 PRD 拆分 → Epic 分解 → 自动开发 → 验证交付。

## Usage
```
/auto-dev <requirement> [--max-audit-rounds=N] [--max-fix-rounds=N] [--auto-merge] [--no-auto-merge] [--skip-epic] [--dry-run]
```

## Quick Check

Parse arguments from `$ARGUMENTS`:

```bash
# Extract requirement (first non-option token)
requirement=""
max_audit_rounds=2
max_fix_rounds=3
auto_merge=true
skip_epic=false
dry_run=false

for arg in $ARGUMENTS; do
  case "$arg" in
    --max-audit-rounds=*) max_audit_rounds="${arg#*=}" ;;
    --max-fix-rounds=*) max_fix_rounds="${arg#*=}" ;;
    --auto-merge) auto_merge=true ;;
    --no-auto-merge) auto_merge=false ;;
    --skip-epic) skip_epic=true ;;
    --dry-run) dry_run=true ;;
    --*) ;;
    *)
      if [ -z "$requirement" ]; then
        requirement="$arg"
      fi
      ;;
  esac
done

if [ -z "$requirement" ]; then
  echo "❌ Missing requirement argument. Usage: /auto-dev <requirement> [options]"
  exit 1
fi

echo "requirement=$requirement"
echo "max_audit_rounds=$max_audit_rounds"
echo "max_fix_rounds=$max_fix_rounds"
echo "auto_merge=$auto_merge"
echo "skip_epic=$skip_epic"
echo "dry_run=$dry_run"
```

### Pre-flight Validation

```bash
# 1. GitHub auth
gh auth status >/dev/null 2>&1 || { echo "❌ gh not authenticated. Run: gh auth login"; exit 1; }

# 2. Remote check
remote_url=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$remote_url" == *"automazeio/ccpm"* ]]; then
  echo "❌ Remote is CCPM template repo. Update origin first."
  exit 1
fi

# 3. Directories
mkdir -p ccpm/prds ccpm/epics ccpm/logs

# 4. Basic toolchain
if ! command -v node >/dev/null 2>&1 && ! command -v npm >/dev/null 2>&1; then
  echo "⚠️ node/npm not found. Some validation steps may fail."
fi

# 5. Read spec
if [ ! -f "ccpm/skills/auto-develop-spec.md" ]; then
  echo "⚠️ Spec not found at ccpm/skills/auto-develop-spec.md. Continuing with embedded logic."
fi
```

### Initialize State

```bash
started_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > ccpm/auto-dev-state.json <<EOF
{
  "command": "auto-dev",
  "started_at": "$started_at",
  "requirement": "$requirement",
  "options": {
    "max_audit_rounds": $max_audit_rounds,
    "max_fix_rounds": $max_fix_rounds,
    "auto_merge": $auto_merge,
    "skip_epic": $skip_epic,
    "dry_run": $dry_run
  },
  "phase": "1",
  "current_prd": null,
  "current_epic": null,
  "completed_epics": [],
  "skipped_epics": [],
  "status": "running"
}
EOF

echo "✅ Pre-flight passed. State initialized."
```

## Instructions

You are the Auto-Dev orchestrator. Read `ccpm/skills/auto-develop-spec.md` before proceeding. Then execute the following phases **sequentially**.

### Phase 1: Decompose Requirement → PRDs → Epics

1. **Load requirement**
   - If `requirement` is a file path and the file exists, Read it.
   - Otherwise, treat `requirement` as literal text.

2. **Invoke planner agent**
   - Use `Agent` with `subagent_type="planner"`:
     - **Prompt**: Analyze the total requirement below. Split it into sequentially numbered PRDs (01-, 02-, ...). For each PRD output: name, core features, dependencies (must be earlier PRDs), and acceptance criteria. Verify no circular dependencies. Return a clean numbered list.
     - Attach the requirement text to the prompt.
   - Wait for the response.

3. **Generate PRDs**
   - For each PRD from the planner output, call `/pm:prd-new {feature-name}`.
   - Ensure PRD filenames follow `ccpm/prds/NN-feature-name.md`.
   - Update state `current_prd` after each creation.

4. **Parse PRDs to Epics**
   - For each PRD sequentially:
     - Run `/pm:prd-parse {feature-name}`.
     - Run `/pm:epic-decompose ccpm/epics/NN-feature-name/epic.md` (or `/pm:epic-oneshot NN-feature-name` if the standard decompose path is unavailable).

5. **Audit decomposition**
   - For each generated Epic, invoke `Agent` with `subagent_type="architect"`:
     - **Prompt**: Review the Epic and Task files in `ccpm/epics/NN-feature-name/`. Evaluate against these 4 checkpoints:
       1. Epic boundaries are clear (high cohesion, low coupling, no overlap).
       2. 100% coverage: every PRD feature maps to at least one Task.
       3. Dependency order matches PRD numbering (01 → 02 → 03), no cycles.
       4. Every Task has testable acceptance criteria (input, expected output, pass condition).
       Return exactly `VERDICT: PASS` if all pass, otherwise `VERDICT: FAIL` and list which checkpoints failed with reasons.
   - If `FAIL` and audit retry count < `max_audit_rounds`:
     - Edit the failing PRD/Epic accordingly, then re-run parse/decompose and re-audit.
   - If `FAIL` and retries exhausted, halt and write failure report.

6. **Dry-run exit**
   - If `dry_run=true`, print a summary of planned PRDs/Epics and exit cleanly.

### Phase 2: Sync and Sequential Development

1. **Sync Epics to GitHub**
   - In PRD number order, for each Epic call `/pm:epic-sync NN-feature-name`.

2. **Develop each Epic sequentially**
   For each Epic in order:
   a. Update state `current_epic = NN-feature-name`.
   b. Launch worktree: `/pm:epic-start NN-feature-name`.
   c. For each Task in the Epic:
      - If analysis file missing: `/pm:issue-analyze {task-number}`.
      - Then `/pm:issue-start {task-number}` (or directly launch appropriate agents for implementation).
      - After Task completion, ensure commit format: `Issue #{number}: {description}`.
   d. **Merge**:
      - If `auto_merge=false`, pause and ask user: "Proceed with /pm:epic-merge NN-feature-name? (yes/no)"
      - Else execute `/pm:epic-merge NN-feature-name` directly.
      - If merge conflicts occur:
        - If `skip_epic=true`, record it in `skipped_epics`, continue to next Epic.
        - Otherwise halt, write failure report to `ccpm/logs/auto-dev-YYYY-MM-DD-HHMMSS-fail.md`, and exit.
   e. Append Epic to `completed_epics` in state.
   f. Call `/pm:status` to confirm next item.

### Phase 3: Validation and Delivery

After each Epic merge:
1. **Epic-level validation**
   - Generate tests via `tdd-guide` agent.
   - Run tests via `test-runner` agent.
   - On failure: invoke `code-reviewer` or `build-error-resolver`, fix, and rerun (up to `max_fix_rounds`).
   - If still failing after max rounds, halt and write failure report.
   - Run quick regression: `npm run build` and `npm run test:unit` (or project equivalents).

After all Epics complete:
2. **System-level checks**
   - `npm run build`
   - `tsc --noEmit` (if tsconfig.json exists)
   - Linter (`npm run lint` or equivalent)
   - Full integration + E2E test suite
   - `security-reviewer` agent scan

3. **Deliver**
   - Generate `ccpm/prds/99-project-summary.md` with:
     - Completed PRD/Epic list
     - Skipped Epic list (if any)
     - Test coverage summary
     - Known limitations
   - For each finished Epic: `/pm:epic-close NN-feature-name`.
   - Update `ccpm/auto-dev-state.json`:
     - `status`: `completed`
     - `completed_at`: current ISO datetime
   - Output final success summary.

## Output Format

On success:
```
✅ Auto-Dev Complete

PRDs: {count}
Epics completed: {count}
Epics skipped: {count}
Tests passed: {status}
Build: {status}

Deliverables:
  - ccpm/prds/99-project-summary.md
  - ccpm/auto-dev-state.json

Next: review changes on main and deploy if ready.
```

On failure:
```
❌ Auto-Dev Failed at Phase {N}
Epic: {current_epic or N/A}
Error: {summary}

Details:
  {full error / conflict / test output}

Reports:
  - ccpm/logs/auto-dev-{timestamp}-fail.md
  - ccpm/auto-dev-state.json (last_error)

Fix and resume with:
  /auto-resume
```

## Error Handling Rules

- **Never silently swallow errors.** Every bash failure must be reported.
- **Merge conflicts**: halt unless `--skip-epic` was passed.
- **Test failures after max retries**: halt immediately.
- **State always updated** before halting so `/auto-resume` can continue.
- Follow all project rules in `.claude/rules/` (git, datetime, path-standards, etc.).
