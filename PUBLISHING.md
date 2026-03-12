# Publishing Guide

## Prerequisites

1. GitHub Personal Access Token with `write:packages` scope
2. `.npmrc` configured for GitHub Packages:
   ```
   //npm.pkg.github.com/:_authToken=YOUR_TOKEN
   @thinhpham:registry=https://npm.pkg.github.com/
   ```
3. Node.js ≥ 18, npm ≥ 8

## Release Steps

### 1. Update version

```bash
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
```

### 2. Run checks manually (optional)

```bash
npm run build:hooks          # validate hook files present
node scripts/prepublish-check.cjs  # validate all required files
npm test                     # run test suite
```

### 3. Publish

`prepublishOnly` runs automatically before publish:

```bash
npm publish
```

This runs: `npm run build:hooks && node scripts/prepublish-check.cjs`

### 4. Tag and push

```bash
git add -A
git commit -m "chore: release v$(node -p "require('./package.json').version")"
git tag "v$(node -p "require('./package.json').version")"
git push && git push --tags
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

**Excluded:** `.DS_Store`, `node_modules`, test files, source repos

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

# Install
npm install @thinhpham/myai

# Test init
myai init
myai install --claude
ls .claude/agents/    # should show 12 agents
ls .myai/commands/    # should show 8 commands
cat CLAUDE.md         # should exist
```

## Troubleshooting

**Auth error on publish:**
```bash
npm login --registry=https://npm.pkg.github.com --scope=@thinhpham
```

**Package not found after publish:**
GitHub Packages may take a few minutes to propagate. Try:
```bash
npm install @thinhpham/myai --registry=https://npm.pkg.github.com
```
