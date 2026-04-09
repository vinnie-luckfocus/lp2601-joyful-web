# CLAUDE.md

> Think carefully and implement the most concise solution that changes as little code as possible.

## Core Philosophy

- **Simplicity over complexity** - Prefer simple, straightforward solutions
- **Minimal changes** - Change only what's necessary to achieve the goal
- **Follow existing patterns** - Consistency with existing codebase

---

## Coding Style

### Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```typescript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

### File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

### Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

Use async/await with try-catch:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

### Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

Use Zod for schema-based validation:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

### Console.log

- No `console.log` statements in production code
- Use proper logging libraries instead

---

## Testing Requirements

### Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows

### Test-Driven Development

MANDATORY workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Coverage reports
npm run test:coverage
```

---

## Security Guidelines

### Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on all endpoints
- [ ] Error messages don't leak sensitive data

### Secret Management

- NEVER hardcode secrets in source code
- ALWAYS use environment variables or a secret manager
- Validate that required secrets are present at startup
- Rotate any secrets that may have been exposed

### Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues

---

## Git Workflow

### Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

### Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

---

## Agent Orchestration

### Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design | Architectural decisions |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code review | After writing code |
| security-reviewer | Security analysis | Before commits |
| build-error-resolver | Fix build errors | When build fails |
| e2e-runner | E2E testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation | Updating docs |

### Immediate Agent Usage

No user prompt needed:
1. Complex feature requests - Use **planner** agent
2. Code just written/modified - Use **code-reviewer** agent
3. Bug fix or new feature - Use **tdd-guide** agent
4. Architectural decision - Use **architect** agent

### Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of auth module
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utilities

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3
```

---

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
- [ ] Tests pass (80%+ coverage)
- [ ] Security checklist passed

---

## Project Structure

```
lp2601-joyful-web/
├── backend/           # Express + TypeScript API
├── frontend/          # React + Vite + TypeScript
├── database/          # Migrations and seeds
├── tests/             # Integration tests
├── ccpm/              # PM artifacts (epics, PRDs, tasks)
│   ├── epics/         # Epic documentation
│   └── prds/          # Product requirements
└── .claude/           # PM commands, rules, and scripts
    ├── commands/      # Slash commands
    ├── rules/         # Project rules
    └── scripts/       # Automation scripts
```

---

## Project Rules Reference

The following rules are enforced in this project. Refer to `.claude/rules/` for full details:

### Development Operations
- **`standard-patterns.md`** - Fail fast, minimal validation, concise output, smart defaults
- **`worktree-operations.md`** - Epic worktrees from clean main, commit format `Issue #{number}: {description}`
- **`branch-operations.md`** - Branch per epic, `epic/{name}` naming, pull before push
- **`agent-coordination.md`** - File-level parallelism, atomic commits, human conflict resolution

### Code Quality
- **`test-execution.md`** - Use test-runner agent, no mocking, verbose output, analyze test structure first
- **`use-ast-grep.md`** - Prefer ast-grep for structural code search over regex when available
- **`path-standards.md`** - No absolute paths with usernames in docs, use relative paths

### GitHub & Documentation
- **`github-operations.md`** - ALWAYS check remote origin before write ops (protect against CCPM template repo)
- **`frontmatter-operations.md`** - Preserve created field, update updated field on changes
- **`strip-frontmatter.md`** - Remove YAML frontmatter before posting to GitHub
- **`datetime.md`** - Use `date -u +"%Y-%m-%dT%H:%M:%SZ"` for all timestamps, never placeholders

### Language-Specific Rules
- **`common/`** - Universal coding style, testing, security, performance, patterns
- **`typescript/`** - TypeScript/JavaScript specific extensions
- **`python/`**, **`golang/`**, **`swift/`** - Language-specific rules as applicable

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router (routing)
- Vitest (testing)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (database)
- JWT (authentication)
- Zod (validation)
- Jest (testing)

---

## Commands Reference

### PM Commands (via / command)
- `/pm:prd-new <feature>` - Create new PRD
- `/pm:epic-start <name>` - Start epic development
- `/pm:epic-merge <name>` - Merge epic to main
- `/pm:issue-start <number>` - Start working on issue
- `/pm:issue-sync <number>` - Sync issue to GitHub

### Development
- `npm run dev` - Start development servers
- `npm run seed` - Seed database
- `npm test` - Run tests
