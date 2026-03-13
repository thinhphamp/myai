# Publishing Guide

## Prerequisites

1. npm account with access to `@thinhpham` scope
2. `NPM_TOKEN` secret added to GitHub repo settings:
   - npmjs.com → Access Tokens → Generate New Token → **Automation**
   - GitHub repo → Settings → Secrets and variables → Actions → `NPM_TOKEN`
3. Node.js ≥ 18, npm ≥ 8

## Release Flow (tag-based CI)

### 1. Update version + changelog

```bash
npm version patch   # 0.3.1 → 0.3.2
npm version minor   # 0.3.1 → 0.4.0
npm version major   # 0.3.1 → 1.0.0
```

Update `CHANGELOG.md` with what changed.

### 2. Commit, tag, and push

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release v$(node -p "require('./package.json').version")"
git tag "v$(node -p "require('./package.json').version")"
git push && git push --tags
```

Pushing the tag triggers `.github/workflows/release.yml` which:
1. Installs dependencies
2. Runs tests
3. Publishes to npm with `--access public`

### 3. Verify publish

```bash
npm info @thinhpham/myai version
```

## npx Usage (after publish)

```bash
# Initialize myai in a project
npx @thinhpham/myai@latest init

# Initialize with all runtimes
npx @thinhpham/myai@latest init --all

# Install for specific runtimes
npx @thinhpham/myai@latest install --claude --gemini
```

## Manual Publish (fallback)

```bash
npm run build:hooks
node scripts/prepublish-check.cjs
npm publish --access public
```

## What Gets Published

The `files` array in `package.json` controls what's included:

```
.myai/               — the system installed into projects
bin/                 — CLI entry point
lib/                 — commands and utilities
docs-templates/      — docs/ brain layer templates
plans-templates/     — plans/ structure templates
runtime-templates/   — CLAUDE.md, opencode.json, GEMINI.md, AGENTS.md
scripts/postinstall.cjs
```

**Excluded:** `.DS_Store`, `node_modules`, test files

## Validation Counts

The prepublish check enforces:

- **30** skills in `.myai/skills/`
- **12** agents in `.myai/agents/`
- **8** commands in `.myai/commands/`
- **4** rules in `.myai/rules/`
- **5** hooks (session-init, dev-rules-reminder, privacy-block, post-edit-simplify-reminder, usage-context-awareness)
- **6** hook lib files

## Testing After Publish

```bash
# Create a test project
mkdir /tmp/test-myai && cd /tmp/test-myai
npm init -y

# Install via npx
npx @thinhpham/myai@latest init

# Verify
ls .myai/commands/    # should show 8 commands
ls .claude/agents/    # should show 12 agents (if --claude used)
cat CLAUDE.md         # should exist
```

## Troubleshooting

**Auth error on publish:**
```bash
npm login --registry=https://registry.npmjs.org
```

**Scope not found:**
Make sure the `@thinhpham` scope exists on npmjs.com. First publish of a scoped package requires `--access public`.
