/**
 * install.js — myai multi-runtime installer
 *
 * Copies .myai/ system to the target runtime's config directory.
 *
 * Runtimes:
 *   --claude    Local: ./.claude/   Global: ~/.claude/
 *   --opencode  Local: ./.opencode/ Global: ~/.config/opencode/
 *   --gemini    Local: ./GEMINI.md  Global: ~/.gemini/GEMINI.md
 *   --codex     Local: ./AGENTS.md  Global: ~/.codex/AGENTS.md
 *   --cursor    Local: ./.cursor/   (no global — Cursor rules are project-scoped)
 *   --all       All five runtimes
 *   --global    Install to user config dir instead of project dir
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';
import { copyDirRecursive, getPackageRoot } from '../utils/file-operations.js';

// ─── Path helpers ──────────────────────────────────────────────────────────────

function getLocalDir(runtime) {
  if (runtime === 'opencode') return '.opencode';
  if (runtime === 'gemini') return '.'; // writes GEMINI.md to project root
  if (runtime === 'codex') return '.';  // writes AGENTS.md to project root
  if (runtime === 'cursor') return '.cursor';
  return '.claude';
}

function getGlobalDir(runtime) {
  if (runtime === 'opencode') {
    return process.env.OPENCODE_CONFIG_DIR
      || (process.env.XDG_CONFIG_HOME ? path.join(process.env.XDG_CONFIG_HOME, 'opencode') : null)
      || path.join(os.homedir(), '.config', 'opencode');
  }
  if (runtime === 'gemini') {
    return process.env.GEMINI_CONFIG_DIR || path.join(os.homedir(), '.gemini');
  }
  if (runtime === 'codex') {
    return process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  }
  if (runtime === 'cursor') {
    return null; // Cursor rules are project-scoped only — no global dir
  }
  // claude
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

// ─── Settings merge ────────────────────────────────────────────────────────────

/**
 * Merge myai hooks into an existing settings.json.
 * Hooks are appended (not replaced) so user customizations are preserved.
 */
function mergeSettings(targetSettingsPath, sourceSettings, isGlobal) {
  let existing = {};
  if (fs.existsSync(targetSettingsPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(targetSettingsPath, 'utf8'));
    } catch {
      existing = {};
    }
  }

  // Build hooks with correct paths
  const hooksBase = isGlobal ? '~/.claude/hooks' : '$CLAUDE_PROJECT_DIR/.claude/hooks';

  const myaiHooks = {
    SessionStart: [
      {
        matcher: 'startup|resume|clear|compact',
        hooks: [{ type: 'command', command: `node "${hooksBase}/session-init.cjs"` }]
      }
    ],
    UserPromptSubmit: [
      {
        hooks: [
          { type: 'command', command: `node "${hooksBase}/dev-rules-reminder.cjs"` },
          { type: 'command', command: `node "${hooksBase}/usage-context-awareness.cjs"`, timeout: 30 }
        ]
      }
    ],
    PreToolUse: [
      {
        matcher: 'Bash|Glob|Grep|Read|Edit|Write',
        hooks: [{ type: 'command', command: `node "${hooksBase}/privacy-block.cjs"` }]
      }
    ],
    PostToolUse: [
      {
        matcher: 'Edit|Write|MultiEdit',
        hooks: [{ type: 'command', command: `node "${hooksBase}/post-edit-simplify-reminder.cjs"` }]
      },
      {
        matcher: '*',
        hooks: [{ type: 'command', command: `node "${hooksBase}/usage-context-awareness.cjs"` }]
      }
    ]
  };

  // Merge: append myai hooks without overwriting existing ones
  const merged = { ...existing };

  if (!merged.hooks) merged.hooks = {};

  for (const [event, entries] of Object.entries(myaiHooks)) {
    if (!merged.hooks[event]) {
      merged.hooks[event] = entries;
    } else {
      // Only add hooks not already present (match by command string)
      const existingCommands = new Set(
        merged.hooks[event].flatMap(e => (e.hooks || []).map(h => h.command))
      );
      for (const entry of entries) {
        const newCmds = (entry.hooks || []).map(h => h.command);
        const alreadyExists = newCmds.every(cmd => existingCommands.has(cmd));
        if (!alreadyExists) {
          merged.hooks[event].push(entry);
        }
      }
    }
  }

  fs.writeFileSync(targetSettingsPath, JSON.stringify(merged, null, 2) + '\n');
}

// ─── Runtime installers ────────────────────────────────────────────────────────

function installClaude(targetDir, pkgRoot, isGlobal) {
  logger.info(`Installing for Claude Code → ${targetDir}`);

  fs.mkdirSync(targetDir, { recursive: true });

  // Snapshot existing settings BEFORE copy (copy would overwrite them)
  const settingsPath = path.join(targetDir, 'settings.json');
  let existingSettings = {};
  if (fs.existsSync(settingsPath)) {
    try { existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch { /* ignore */ }
  }

  // Copy .myai/ → .claude/ (overwrite hooks/agents/skills/commands/rules)
  const myaiSrc = path.join(pkgRoot, '.myai');
  const result = copyDirRecursive(myaiSrc, targetDir, false); // overwrite=true for install
  logger.success(`Copied ${result.copied} files to ${targetDir}`);

  // Merge: start from existing user settings, then layer myai hooks on top
  const sourceSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const merged = { ...sourceSettings, ...existingSettings };
  fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + '\n');
  mergeSettings(settingsPath, sourceSettings, isGlobal);
  logger.success('Merged hooks into settings.json');

  // Copy CLAUDE.md (local only — global doesn't get a project CLAUDE.md)
  if (!isGlobal) {
    const claudeMdSrc = path.join(pkgRoot, 'runtime-templates', 'claude', 'CLAUDE.md');
    const claudeMdDest = path.join(process.cwd(), 'CLAUDE.md');
    if (!fs.existsSync(claudeMdDest)) {
      fs.copyFileSync(claudeMdSrc, claudeMdDest);
      logger.success('Created CLAUDE.md');
    } else {
      logger.dim('CLAUDE.md already exists — skipped');
    }
  }
}

function installOpenCode(targetDir, pkgRoot, isGlobal) {
  logger.info(`Installing for OpenCode → ${targetDir}`);

  fs.mkdirSync(targetDir, { recursive: true });

  // Copy .myai/ system into opencode config dir
  const myaiSrc = path.join(pkgRoot, '.myai');
  const result = copyDirRecursive(myaiSrc, targetDir, false);
  logger.success(`Copied ${result.copied} files to ${targetDir}`);

  // Write/merge opencode.json
  const configPath = path.join(targetDir, 'opencode.json');
  const templatePath = path.join(pkgRoot, 'runtime-templates', 'opencode', 'opencode.json');
  if (!fs.existsSync(configPath)) {
    fs.copyFileSync(templatePath, configPath);
    logger.success('Created opencode.json');
  } else {
    logger.dim('opencode.json already exists — skipped (merge manually if needed)');
  }
}

function installGemini(targetDir, pkgRoot, isGlobal) {
  const templatePath = path.join(pkgRoot, 'runtime-templates', 'gemini', 'GEMINI.md');

  if (isGlobal) {
    // Global: write to ~/.gemini/GEMINI.md
    fs.mkdirSync(targetDir, { recursive: true });
    const dest = path.join(targetDir, 'GEMINI.md');
    logger.info(`Installing for Gemini CLI → ${dest}`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(templatePath, dest);
      logger.success('Created GEMINI.md');
    } else {
      logger.dim('GEMINI.md already exists — skipped');
    }
  } else {
    // Local: write GEMINI.md to project root
    const dest = path.join(process.cwd(), 'GEMINI.md');
    logger.info(`Installing for Gemini CLI → ${dest}`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(templatePath, dest);
      logger.success('Created GEMINI.md');
    } else {
      logger.dim('GEMINI.md already exists — skipped');
    }
  }
}

function installCodex(targetDir, pkgRoot, isGlobal) {
  const templatePath = path.join(pkgRoot, 'runtime-templates', 'codex', 'AGENTS.md');

  if (isGlobal) {
    // Global: write to ~/.codex/AGENTS.md
    fs.mkdirSync(targetDir, { recursive: true });
    const dest = path.join(targetDir, 'AGENTS.md');
    logger.info(`Installing for Codex → ${dest}`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(templatePath, dest);
      logger.success('Created AGENTS.md');
    } else {
      logger.dim('AGENTS.md already exists — skipped');
    }
  } else {
    // Local: write AGENTS.md to project root
    const dest = path.join(process.cwd(), 'AGENTS.md');
    logger.info(`Installing for Codex → ${dest}`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(templatePath, dest);
      logger.success('Created AGENTS.md');
    } else {
      logger.dim('AGENTS.md already exists — skipped');
    }
  }
}

function installCursor(pkgRoot, isGlobal) {
  if (isGlobal) {
    logger.warning('Cursor rules are project-scoped — --global is not supported for Cursor');
    logger.dim('Run "myai install --cursor" inside your project directory instead');
    return;
  }

  const templateSrc = path.join(pkgRoot, 'runtime-templates', 'cursor', '.cursor');
  const dest = path.join(process.cwd(), '.cursor');
  logger.info(`Installing for Cursor → ${dest}`);

  fs.mkdirSync(path.join(dest, 'rules'), { recursive: true });

  const rulesDir = path.join(templateSrc, 'rules');
  for (const file of fs.readdirSync(rulesDir)) {
    const src = path.join(rulesDir, file);
    const destFile = path.join(dest, 'rules', file);
    if (!fs.existsSync(destFile)) {
      fs.copyFileSync(src, destFile);
      logger.success(`Created .cursor/rules/${file}`);
    } else {
      logger.dim(`.cursor/rules/${file} already exists — skipped`);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export async function install(options) {
  const { claude, opencode, gemini, codex, cursor, all, global: isGlobal } = options;

  const pkgRoot = getPackageRoot();

  // Determine which runtimes to install
  const runtimes = [];
  if (all) {
    runtimes.push('claude', 'opencode', 'gemini', 'codex', 'cursor');
  } else {
    if (claude) runtimes.push('claude');
    if (opencode) runtimes.push('opencode');
    if (gemini) runtimes.push('gemini');
    if (codex) runtimes.push('codex');
    if (cursor) runtimes.push('cursor');
  }

  if (runtimes.length === 0) {
    logger.warning('No runtime specified.');
    logger.info('Usage: myai install [--claude] [--opencode] [--gemini] [--codex] [--cursor] [--all] [--global]');
    return;
  }

  logger.header(`myai install${isGlobal ? ' --global' : ''}`);

  const errors = [];

  for (const runtime of runtimes) {
    try {
      const targetDir = isGlobal ? getGlobalDir(runtime) : path.join(process.cwd(), getLocalDir(runtime));

      switch (runtime) {
        case 'claude':
          installClaude(targetDir, pkgRoot, isGlobal);
          break;
        case 'opencode':
          installOpenCode(targetDir, pkgRoot, isGlobal);
          break;
        case 'gemini':
          installGemini(targetDir, pkgRoot, isGlobal);
          break;
        case 'codex':
          installCodex(targetDir, pkgRoot, isGlobal);
          break;
        case 'cursor':
          installCursor(pkgRoot, isGlobal);
          break;
      }
    } catch (err) {
      logger.error(`Failed to install for ${runtime}: ${err.message}`);
      errors.push({ runtime, error: err.message });
    }
  }

  // Summary
  logger.header('Install complete');

  const installed = runtimes.filter(r => !errors.find(e => e.runtime === r));
  if (installed.length > 0) {
    for (const runtime of installed) {
      const dir = isGlobal ? getGlobalDir(runtime) : getLocalDir(runtime);
      logger.success(`${runtime}: ${dir}`);
    }
  }

  if (errors.length > 0) {
    logger.warning(`\n${errors.length} runtime(s) failed:`);
    for (const { runtime, error } of errors) {
      logger.error(`  ${runtime}: ${error}`);
    }
  }

  if (installed.includes('claude') && !isGlobal) {
    logger.dim('\nNext: Open Claude Code — hooks activate automatically.');
  }
}
