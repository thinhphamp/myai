#!/usr/bin/env node
/**
 * SessionStart Hook — myai session initialization
 *
 * Fires: Once per session (startup, resume, clear, compact)
 * Purpose:
 *   1. Detect project info (type, framework, git branch)
 *   2. Inject docs/STATE.md (project-level context)
 *   3. Inject plans/{active}/PROGRESS.md (session-level context)
 *   4. Warn on compact source (approval state loss)
 *
 * Exit codes:
 *   0 — Success (non-blocking)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  loadConfig,
  writeEnv,
  isHookEnabled
} = require('./lib/myai-config.cjs');
const {
  detectProjectType,
  detectPackageManager,
  detectFramework,
  getGitBranch,
  buildContextOutput,
  execSafe
} = require('./lib/project-detector.cjs');

if (!isHookEnabled('session-init')) process.exit(0);

// ─── State readers ────────────────────────────────────────────────────────────

/**
 * Read docs/STATE.md and extract the Active Plan path
 * Returns { content, activePlanPath }
 */
function readProjectState(baseDir) {
  const statePath = path.join(baseDir, 'docs', 'STATE.md');
  if (!fs.existsSync(statePath)) return { content: null, activePlanPath: null };

  const content = fs.readFileSync(statePath, 'utf8');

  // Extract: "Plan: plans/2026-03-11-feature-slug" or "Plan: none"
  const match = content.match(/^Plan:\s*(.+)$/m);
  const activePlanPath = (match && match[1].trim() !== 'none') ? match[1].trim() : null;

  return { content, activePlanPath };
}

/**
 * Read plans/{active}/PROGRESS.md
 */
function readPlanProgress(baseDir, activePlanPath) {
  if (!activePlanPath) return null;
  const progressPath = path.join(baseDir, activePlanPath, 'PROGRESS.md');
  if (!fs.existsSync(progressPath)) return null;
  return fs.readFileSync(progressPath, 'utf8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const stdin = fs.readFileSync(0, 'utf-8').trim();
    const data = stdin ? JSON.parse(stdin) : {};
    const source = data.source || 'unknown';
    const envFile = process.env.CLAUDE_ENV_FILE;
    const baseDir = process.cwd();

    const config = loadConfig();

    const detections = {
      type: detectProjectType(config.project?.type),
      pm: detectPackageManager(config.project?.packageManager),
      framework: detectFramework(config.project?.framework)
    };

    const gitBranch = getGitBranch();

    // Write env vars for other hooks
    if (envFile) {
      writeEnv(envFile, 'MYAI_PROJECT_TYPE', detections.type || '');
      writeEnv(envFile, 'MYAI_PACKAGE_MANAGER', detections.pm || '');
      writeEnv(envFile, 'MYAI_FRAMEWORK', detections.framework || '');
      writeEnv(envFile, 'MYAI_GIT_BRANCH', gitBranch || '');
      writeEnv(envFile, 'MYAI_PROJECT_ROOT', baseDir);
      writeEnv(envFile, 'MYAI_DOCS_PATH', path.join(baseDir, 'docs'));
      writeEnv(envFile, 'MYAI_PLANS_PATH', path.join(baseDir, 'plans'));
    }

    // ── Session context output ──────────────────────────────────────────────
    const lines = [];

    lines.push(`Session ${source}.`);

    if (detections.framework) lines.push(`Framework: ${detections.framework}.`);
    if (detections.pm) lines.push(`Package manager: ${detections.pm}.`);
    if (gitBranch) lines.push(`Branch: ${gitBranch}.`);

    // ── Inject docs/STATE.md (project brain) ───────────────────────────────
    const { content: stateContent, activePlanPath } = readProjectState(baseDir);

    if (stateContent) {
      lines.push('');
      lines.push('## Project State (docs/STATE.md)');
      lines.push(stateContent.trim());
    }

    // ── Inject plans/{active}/PROGRESS.md (session resume) ─────────────────
    const progressContent = readPlanProgress(baseDir, activePlanPath);

    if (progressContent) {
      lines.push('');
      lines.push(`## Session Resume (${activePlanPath}/PROGRESS.md)`);
      lines.push(progressContent.trim());
    } else if (activePlanPath) {
      lines.push('');
      lines.push(`## Active Plan: ${activePlanPath}`);
      lines.push('No PROGRESS.md found — start fresh or run /myai:resume for context.');
    }

    // ── Compact warning (approval state loss mitigation) ───────────────────
    if (source === 'compact') {
      lines.push('');
      lines.push('⚠ CONTEXT COMPACTED — If you were waiting for user approval via AskUserQuestion,');
      lines.push('you MUST re-confirm with the user before proceeding.');
    }

    // ── User assertions from config ────────────────────────────────────────
    if (config.assertions?.length > 0) {
      lines.push('');
      lines.push('## User Assertions');
      config.assertions.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
    }

    console.log(lines.join('\n'));
    process.exit(0);
  } catch (err) {
    // Non-blocking — never fail the session
    process.stderr.write(`[session-init] ${err.message}\n`);
    process.exit(0);
  }
}

main();
