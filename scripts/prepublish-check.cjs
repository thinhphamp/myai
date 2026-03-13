#!/usr/bin/env node
/**
 * prepublish-check.cjs
 *
 * Validates that all required files are present before publishing.
 * Run as part of `npm run prepublishOnly`.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let ok = true;

function check(relPath, label) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) {
    console.error(`✗ MISSING: ${relPath}${label ? ` (${label})` : ''}`);
    ok = false;
  }
}

function checkDir(relPath, minFiles, label) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) {
    console.error(`✗ MISSING DIR: ${relPath}`);
    ok = false;
    return;
  }
  const files = fs.readdirSync(full).filter(f => !f.startsWith('.'));
  if (files.length < minFiles) {
    console.error(`✗ TOO FEW FILES in ${relPath}: ${files.length}/${minFiles} (${label})`);
    ok = false;
  }
}

console.log('Running prepublish checks...\n');

// ── Core CLI ──────────────────────────────────────────────────────────────────
check('package.json');
check('bin/myai.js');
check('lib/commands/init.js');
check('lib/commands/update.js');
check('lib/commands/install.js');
check('lib/utils/logger.js');
check('lib/utils/file-operations.js');
check('lib/utils/diff-utils.js');
check('lib/utils/prompt-helpers.js');
check('lib/utils/version-checker.js');

// ── Scripts ───────────────────────────────────────────────────────────────────
check('scripts/postinstall.cjs');
check('scripts/prepublish-check.cjs');
check('scripts/build-hooks.js');

// ── .myai system ──────────────────────────────────────────────────────────────
check('.myai/settings.json');

// Hooks
check('.myai/hooks/session-init.cjs');
check('.myai/hooks/dev-rules-reminder.cjs');
check('.myai/hooks/privacy-block.cjs');
check('.myai/hooks/post-edit-simplify-reminder.cjs');
check('.myai/hooks/usage-context-awareness.cjs');

// Hook lib
check('.myai/hooks/lib/myai-config.cjs');
check('.myai/hooks/lib/colors.cjs');
check('.myai/hooks/lib/context-builder.cjs');
check('.myai/hooks/lib/privacy-checker.cjs');
check('.myai/hooks/lib/project-detector.cjs');
check('.myai/hooks/lib/scout-checker.cjs');

// Agents (13 required)
const REQUIRED_AGENTS = [
  'planner', 'researcher', 'fullstack-developer', 'code-reviewer',
  'tester', 'debugger', 'git-manager', 'docs-manager', 'ui-ux-designer',
  'verifier', 'roadmapper', 'brainstormer', 'ops-manager'
];
for (const agent of REQUIRED_AGENTS) {
  check(`.myai/agents/${agent}.md`, 'agent');
}

// Commands (8 required)
const REQUIRED_COMMANDS = [
  'myai:new-project', 'myai:plan', 'myai:cook', 'myai:progress',
  'myai:pause', 'myai:resume', 'myai:verify', 'myai:kanban'
];
for (const cmd of REQUIRED_COMMANDS) {
  check(`.myai/commands/${cmd}.md`, 'command');
}

// Rules (4 required)
const REQUIRED_RULES = [
  'development-rules', 'primary-workflow', 'orchestration-protocol', 'documentation-management'
];
for (const rule of REQUIRED_RULES) {
  check(`.myai/rules/${rule}.md`, 'rule');
}

// Skills (minimum 25)
checkDir('.myai/skills', 25, 'skills');

// ── Templates ─────────────────────────────────────────────────────────────────
check('docs-templates/PROJECT.md');
check('docs-templates/SPEC.md');
check('docs-templates/ROADMAP.md');
check('docs-templates/STATE.md');

check('plans-templates/plan.md');
check('plans-templates/phase-template.md');
check('plans-templates/PROGRESS.md');

check('runtime-templates/claude/CLAUDE.md');
check('runtime-templates/opencode/opencode.json');
check('runtime-templates/gemini/GEMINI.md');
check('runtime-templates/codex/AGENTS.md');

// ── Docs ──────────────────────────────────────────────────────────────────────
check('README.md');

// ── Summary ───────────────────────────────────────────────────────────────────
const skillCount = fs.existsSync(path.join(root, '.myai/skills'))
  ? fs.readdirSync(path.join(root, '.myai/skills')).filter(f => !f.startsWith('.')).length
  : 0;

console.log(`\nSkills: ${skillCount}`);
console.log(`Agents: ${REQUIRED_AGENTS.length}`);
console.log(`Commands: ${REQUIRED_COMMANDS.length}`);
console.log(`Rules: ${REQUIRED_RULES.length}`);

if (ok) {
  console.log('\n✓ All prepublish checks passed');
} else {
  console.error('\n✗ Prepublish checks failed — fix the issues above before publishing');
  process.exit(1);
}
