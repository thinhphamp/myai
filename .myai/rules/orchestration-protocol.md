# Orchestration Protocol

## Delegation Context (MANDATORY)

When spawning subagents via Task tool, **ALWAYS** include in prompt:

1. **Work Context Path**: The git root of the PRIMARY files being worked on
2. **Reports Path**: `{work_context}/plans/reports/` for that project
3. **Plans Path**: `{work_context}/plans/` for that project

**Example:**
```
Task prompt: "Fix parser bug.
Work context: /path/to/project
Reports: /path/to/project/plans/reports/
Plans: /path/to/project/plans/"
```

**Rule:** If CWD differs from work context (editing files in a different project), use the **work context paths**, not CWD paths.

---

#### Sequential Chaining
Chain subagents when tasks have dependencies or require outputs from previous steps:
- **Planning → Implementation → Testing → Review**: Use for feature development
- **Research → Design → Code → Documentation**: Use for new system components
- Each agent completes fully before the next begins
- Pass context and outputs between agents in the chain

#### Parallel Execution
Spawn multiple subagents simultaneously for independent tasks:
- **Code + Tests + Docs**: When implementing separate, non-conflicting components
- **Multiple Feature Areas**: Different agents working on isolated features
- **Cross-platform Development**: iOS and Android specific implementations
- **Careful Coordination**: Ensure no file conflicts or shared resource contention
- **Merge Strategy**: Plan integration points before parallel execution begins

## Agent Roster

Available agents in `.myai/agents/`:

| Agent | Role |
|-------|------|
| `planner` | Creates implementation plans |
| `researcher` | Conducts technical research |
| `fullstack-developer` | Implements features end-to-end |
| `code-reviewer` | Reviews code quality |
| `tester` | Writes and runs tests |
| `debugger` | Diagnoses and fixes bugs |
| `git-manager` | Manages git operations |
| `docs-manager` | Updates project documentation |
| `ui-ux-designer` | Designs and implements UI |
| `verifier` | Goal-backward phase verification |
| `roadmapper` | Creates project roadmaps |
| `codebase-mapper` | Analyzes codebase structure |
