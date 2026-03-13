---
name: docs:init
description: Generate all deeper docs/ files from codebase analysis — codebase-summary, code-standards, system-architecture, design-guidelines, deployment-guide
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
---

<objective>
Generate the full docs/ brain layer by analyzing the codebase. Runs repomix + 4 parallel analysis agents, then delegates to docs-manager to synthesize results into all deeper doc files. Repomix provides full file-level detail; analysis agents provide structured analysis.
</objective>

<process>

## Step 1: Check Existing Docs

```bash
ls docs/ 2>/dev/null
```

If deeper docs already exist (code-standards.md, system-architecture.md, etc.), warn:
> "Deeper docs already exist. Use `/docs:update` to update them, or continue to regenerate. [continue/cancel]"

## Step 2: Run Repomix

Generate `.repomixignore` if it doesn't exist — see repomix skill for standard content.

Check repo size before running:
```bash
find . -not -path './.git/*' -not -path './node_modules/*' | wc -l
```

If file count > 500: warn user — "Repo is large ({N} files). Repomix output may exceed context limits. Run anyway? [y/n]"

Run repomix to pack the full codebase:
```bash
npx repomix --output repomix-output.xml 2>/dev/null || repomix --output repomix-output.xml
```

## Step 3: Run Codebase Analysis (parallel)

Ensure output directory exists:
```bash
mkdir -p plans/codebase
```

Spawn 4 general-purpose agents in parallel via Task tool:

```
Agent 1 — focus: tech
  Analyze the technology stack and external integrations.
  Write plans/codebase/STACK.md (languages, frameworks, key deps, runtime, package manager, config) and plans/codebase/INTEGRATIONS.md (APIs, databases, auth, monitoring, CI/CD, env vars).
  Always include file paths with backticks. Use the Write tool to create files.

Agent 2 — focus: arch
  Analyze architecture and file structure.
  Write plans/codebase/ARCHITECTURE.md (pattern, layers, data flow, entry points, error handling) and plans/codebase/STRUCTURE.md (directory layout, key file locations, naming conventions, where to add new code).
  Always include file paths with backticks. Use the Write tool to create files.

Agent 3 — focus: quality
  Analyze coding conventions and testing patterns.
  Write plans/codebase/CONVENTIONS.md (naming, code style, imports, error handling, comments, module design) and plans/codebase/TESTING.md (framework, file organization, structure, mocking, coverage, common patterns).
  Always include file paths with backticks. Use the Write tool to create files.

Agent 4 — focus: concerns
  Identify technical debt, known bugs, security risks, performance bottlenecks, fragile areas, missing coverage.
  Write plans/codebase/CONCERNS.md.
  Always include file paths with backticks. Use the Write tool to create files.
```

Wait for all 4 to complete.

## Step 4: Delegate to docs-manager

Spawn docs-manager agent with task: `docs:init`

Pass:
- `repomix-output.xml` path (full codebase detail — use for precise code examples, exact file paths, real function/type names)
- All files written to `plans/codebase/` (structured analysis — use for architectural decisions, patterns, concerns)
- Instruction to generate these files if applicable:
  - `docs/codebase-summary.md` — always
  - `docs/code-standards.md` — from CONVENTIONS.md + TESTING.md, enriched with real examples from repomix
  - `docs/system-architecture.md` — from ARCHITECTURE.md + STRUCTURE.md + STACK.md + INTEGRATIONS.md, enriched with actual file structure from repomix
  - `docs/design-guidelines.md` — only if UI/frontend code detected
  - `docs/deployment-guide.md` — only if deployment config detected (Dockerfile, CI, k8s, etc.)

## Step 5: Confirm

```
✓ docs/ deeper layer generated:
  - docs/codebase-summary.md
  - docs/code-standards.md
  - docs/system-architecture.md
  - docs/design-guidelines.md  (if applicable)
  - docs/deployment-guide.md   (if applicable)
```

</process>

<success_criteria>
- [ ] repomix-output.xml generated
- [ ] 4 analysis agents completed
- [ ] docs-manager synthesized both sources into docs/ files
- [ ] All generated docs contain real code examples and exact file paths (not invented)
</success_criteria>
