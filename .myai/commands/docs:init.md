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
Generate the full docs/ brain layer by analyzing the codebase. Runs repomix + 4 parallel codebase-mapper agents, then delegates to docs-manager to synthesize results into all deeper doc files. Repomix provides full file-level detail; codebase-mappers provide structured analysis.
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

## Step 3: Run Codebase Mappers (parallel)

Spawn 4 codebase-mapper agents in parallel via Task tool:

```
Agent 1: codebase-mapper — focus: tech     → writes plans/codebase/STACK.md, INTEGRATIONS.md
Agent 2: codebase-mapper — focus: arch     → writes plans/codebase/ARCHITECTURE.md, STRUCTURE.md
Agent 3: codebase-mapper — focus: quality  → writes plans/codebase/CONVENTIONS.md, TESTING.md
Agent 4: codebase-mapper — focus: concerns → writes plans/codebase/CONCERNS.md
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
- [ ] 4 codebase-mapper agents completed
- [ ] docs-manager synthesized both sources into docs/ files
- [ ] All generated docs contain real code examples and exact file paths (not invented)
</success_criteria>
