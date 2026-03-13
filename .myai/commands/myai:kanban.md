---
name: myai:kanban
description: Visual plans dashboard with progress tracking
arguments:
  - name: dir
    description: Plans directory (default: ./plans)
    required: false
---

Plans dashboard with progress tracking and timeline visualization.

## Usage

- `/myai:kanban` — View dashboard for ./plans directory
- `/myai:kanban plans/` — View dashboard for specific directory
- `/myai:kanban --stop` — Stop running server

## Features

- Plan cards with progress bars
- Phase status breakdown (completed, in-progress, pending)
- Timeline/Gantt visualization
- Activity heatmap

## Execution

**IMPORTANT:** Run server as Claude Code background task using `run_in_background: true` with the Bash tool. This makes the server visible in `/tasks` and manageable via task management.

The skill is located at `.myai/skills/plans-kanban/`.

### Stop Server

If `--stop` flag is provided:

```bash
node .myai/skills/plans-kanban/scripts/server.cjs --stop
```

### Start Server

Otherwise, run the kanban server as a background task with `--foreground` flag (keeps process alive for task management):

```bash
# Determine plans directory
INPUT_DIR="{{dir}}"
PLANS_DIR="${INPUT_DIR:-./plans}"

# Start kanban dashboard
node .myai/skills/plans-kanban/scripts/server.cjs \
  --dir "$PLANS_DIR" \
  --host 0.0.0.0 \
  --open \
  --foreground
```

**Critical:** When calling the Bash tool:
- Set `run_in_background: true` to run as background task
- Set `timeout: 300000` (5 minutes) to prevent premature termination
- Parse JSON output and report URL to user

Example Bash tool call:
```json
{
  "command": "node .myai/skills/plans-kanban/scripts/server.cjs --dir \"./plans\" --host 0.0.0.0 --open --foreground",
  "run_in_background": true,
  "timeout": 300000,
  "description": "Start kanban server in background"
}
```

After starting, parse the JSON output (e.g., `{"success":true,"url":"http://localhost:3500/kanban?dir=...","networkUrl":"http://192.168.1.x:3500/kanban?dir=..."}`) and report:
- Local URL for browser access
- Network URL for remote device access (if available)
- Inform user that server is running as a background task (visible in `/tasks`)

**CRITICAL:** MUST display the FULL URL including path and query string. NEVER truncate to just `host:port`. The full URL is required for direct access.
