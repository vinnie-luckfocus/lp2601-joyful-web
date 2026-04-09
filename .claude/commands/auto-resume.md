---
allowed-tools: Bash, Read, Write, Edit, LS, Task, Agent
---

# Auto Resume

扫描当前项目中已拆解但未完成的 PRD/Epic，跳过已完成的，继续执行剩余的开发与验证流程。

## Usage
```
/auto-resume [--from=NN-feature-name] [--max-fix-rounds=N] [--auto-merge] [--no-auto-merge] [--skip-epic] [--dry-run]
```

## Quick Check

Parse arguments from `$ARGUMENTS`:

```bash
from=""
max_fix_rounds=3
auto_merge=true
skip_epic=false
dry_run=false

for arg in $ARGUMENTS; do
  case "$arg" in
    --from=*) from="${arg#*=}" ;;
    --max-fix-rounds=*) max_fix_rounds="${arg#*=}" ;;
    --auto-merge) auto_merge=true ;;
    --no-auto-merge) auto_merge=false ;;
    --skip-epic) skip_epic=true ;;
    --dry-run) dry_run=true ;;
  esac
done

echo "from=$from"
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

# 4. State file check
if [ -f "ccpm/auto-dev-state.json" ]; then
  echo "✅ Found existing state file"
  cat ccpm/auto-dev-state.json | head -20
else
  echo "⚠️ No state file found. Will scan from scratch."
fi
```

## Instructions

You are the Auto-Resume orchestrator. Read `ccpm/skills/auto-develop-spec.md` before proceeding. Then execute the following steps **sequentially**.

### Step 1: Determine Resume Point

1. **Read state file**
   - If `ccpm/auto-dev-state.json` exists and `status` is `running` or `failed`, recover:
     - `phase`, `current_epic`, completed/skipped lists, and previous options.
     - Merge recovered options with command-line overrides (`max_fix_rounds`, `auto_merge`, `skip_epic`, `dry_run` take precedence).
   - If no state file or state is `completed`, treat this as a fresh resume scan.

2. **If `--from` is provided**
   - Start processing from that exact Epic name.

3. **Otherwise scan for remaining work**
   a. List all PRD files `ccpm/prds/01-*.md` through `98-*.md`. Sort by filename.
   b. For each corresponding Epic directory `ccpm/epics/NN-feature-name/`:
      - Call `/pm:epic-status NN-feature-name` if available.
      - Fallback checks:
        - Read `epic.md` frontmatter `status`. Completed means done.
        - Read `github-mapping.md` and check GitHub issue state via `gh issue view {issue_num}`.
        - Check git: does `main` contain merge commit for this epic? Does branch `epic/NN-feature-name` still exist unmerged?
      - Consider an Epic **done** if its frontmatter or GitHub issue says closed/completed **and** the code is present on `main`.
      - If state conflicts (e.g., marked done but code missing), emit ⚠️ warning, mark as "needs_review", and skip it by default.
   c. The first Epic not marked done becomes the `resume_epic`.

4. **Save scan results to state**
   - Update `ccpm/auto-dev-state.json` with `phase: "2"`, `current_epic`, `status: "running"`, and the merged options.

5. **Dry-run exit**
   - If `dry_run=true`, print the list of remaining Epics and exit cleanly.

### Step 2: Continue Development (Phase 2 logic)

For each remaining Epic from `resume_epic` onward, in filename order:

1. **Sync check**
   - If `github-mapping.md` is missing or empty, call `/pm:epic-sync NN-feature-name`.

2. **Start worktree**
   - `/pm:epic-start NN-feature-name`.

3. **Task development**
   - For each Task file in the Epic directory:
     - Derive task number from filename or `github:` frontmatter.
     - If analysis file missing: `/pm:issue-analyze {task-number}`.
     - Then `/pm:issue-start {task-number}` (or launch agents directly).
     - Ensure commits follow `Issue #{number}: {description}`.

4. **Merge**
   - If `auto_merge=false`, pause and ask user before `/pm:epic-merge NN-feature-name`.
   - Else run `/pm:epic-merge NN-feature-name` directly.
   - On merge conflict:
     - If `skip_epic=true`, record in `skipped_epics`, continue.
     - Else halt and write failure report.

5. **State update**
   - Append to `completed_epics` and continue to next Epic.

### Step 3: Validation and Delivery (Phase 3 logic)

After each Epic merge:
1. **Epic-level validation**
   - `tdd-guide` agent for unit tests.
   - `test-runner` agent for execution.
   - Auto-fix up to `max_fix_rounds` via `code-reviewer` / `build-error-resolver`.
   - Halt if still failing.
   - Quick regression: `npm run build` and `npm run test:unit` (or equivalents).

After all Epics:
2. **System-level checks**
   - Build, type-check, linter, full tests, `security-reviewer` scan.

3. **Deliver**
   - Generate or update `ccpm/prds/99-project-summary.md`.
   - `/pm:epic-close NN-feature-name` for each finished Epic.
   - Mark state `completed` with timestamp.
   - Print success summary.

## Output Format

On success:
```
✅ Auto-Resume Complete

Resumed from: {resume_epic}
Epics completed this run: {count}
Epics skipped: {count}

Deliverables:
  - ccpm/prds/99-project-summary.md
  - ccpm/auto-dev-state.json
```

On failure:
```
❌ Auto-Resume Failed at Epic {current_epic}
Error: {summary}

Reports:
  - ccpm/logs/auto-dev-{timestamp}-fail.md
  - ccpm/auto-dev-state.json

After fixing, run again:
  /auto-resume
```

## Error Handling Rules

- **Always update state before halting.**
- **Merge conflict / test failure**: stop unless `--skip-epic` passed.
- **State mismatch warnings**: emit clearly, skip questionable Epics rather than risk overwriting work.
- Follow `.claude/rules/` for git operations, timestamps, and path standards.
