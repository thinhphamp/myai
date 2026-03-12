/**
 * validate command
 *
 * Prints a specific plan phase to stdout so the user (or their AI tool) can
 * review it and confirm it is correctly designed and matches project requirements.
 *
 * Usage:
 *   myai validate                          # list all phases in the latest plan
 *   myai validate "Phase 3"               # print Phase 3 from the latest plan
 *   myai validate "hook" --plan 2026-...  # fuzzy match phase in a specific plan
 *
 * Phase matching is fuzzy: the query is compared against both the phase heading
 * and its URL-safe slug, so "Phase 3", "hook", or "hook-system" all work.
 *
 * When no plan is specified, the lexicographically latest plan folder under
 * plans/ is used (date-prefixed folder names sort correctly this way).
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Read the `type` field from a plan.md YAML frontmatter block.
 * Returns 'task', 'phase', or 'unknown'.
 * @param {string} filePath
 * @returns {'task' | 'phase' | 'unknown'}
 */
function readPlanType(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---[\s\S]*?^type:\s*(\w+)/m);
    if (match) return match[1];
  } catch { /* ignore */ }
  return 'unknown';
}

/**
 * Find all plan.md files under plans/ in the current project.
 * @param {string} targetDir - Absolute path to the project root.
 * @returns {{ name: string, file: string, type: string }[]}
 */
function findPlans(targetDir) {
  const plansDir = path.join(targetDir, 'plans');
  if (!fs.existsSync(plansDir)) return [];

  return fs.readdirSync(plansDir)
    .filter(entry => {
      const planFile = path.join(plansDir, entry, 'plan.md');
      return fs.existsSync(planFile);
    })
    .map(entry => {
      const file = path.join(plansDir, entry, 'plan.md');
      return { name: entry, file, type: readPlanType(file) };
    });
}

/**
 * Parse phases from a plan.md.
 * A phase is any heading matching /Phase \d+/i (##, ###, or ####).
 * Collection stops when the next non-phase ## section begins.
 * @param {string} content - Raw plan.md content.
 * @returns {{ heading: string, slug: string, content: string }[]}
 */
function parsePhases(content) {
  const lines = content.split('\n');
  const phases = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^#{2,4}\s+(Phase\s+\d+[^#\n]*)/i);
    if (match) {
      if (current) {
        current.content = current.lines.join('\n').trim();
        delete current.lines;
        phases.push(current);
      }
      const heading = match[1].trim();
      const slug = heading.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      current = { heading, slug, lines: [line] };
    } else if (current) {
      // Stop collecting if we hit another top-level section (## not a phase)
      if (line.match(/^#{2}\s+[^#]/) && !line.match(/^#{2,4}\s+Phase/i)) {
        current.content = current.lines.join('\n').trim();
        delete current.lines;
        phases.push(current);
        current = null;
      } else {
        current.lines.push(line);
      }
    }
  }

  if (current) {
    current.content = current.lines.join('\n').trim();
    delete current.lines;
    phases.push(current);
  }

  return phases;
}

/**
 * Find a phase by partial name or slug match (case-insensitive).
 * @param {{ heading: string, slug: string }[]} phases
 * @param {string} query - User-supplied search term.
 * @returns {{ heading: string, slug: string, content: string } | undefined}
 */
function findPhase(phases, query) {
  const q = query.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return phases.find(p =>
    p.slug.includes(q) ||
    p.heading.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Main handler for `myai validate [phase]`.
 * @param {string | undefined} phaseName - Phase name or partial match string.
 * @param {{ plan?: string }} options - Commander options.
 */
export async function validate(phaseName, options) {
  const targetDir = process.cwd();

  const plans = findPlans(targetDir);

  if (plans.length === 0) {
    logger.error('No plans found. Run "myai init" first or create a plan under plans/.');
    process.exit(1);
  }

  // Pick plan: --plan flag or latest (first sorted desc)
  let plan;
  if (options.plan) {
    plan = plans.find(p => p.name.includes(options.plan));
    if (!plan) {
      logger.error(`No plan found matching: ${options.plan}`);
      logger.dim(`Available plans:\n${plans.map(p => `  ${p.name}  [${p.type}]`).join('\n')}`);
      process.exit(1);
    }
  } else {
    plan = plans.sort((a, b) => b.name.localeCompare(a.name))[0];
  }

  const content = fs.readFileSync(plan.file, 'utf8');
  const phases = parsePhases(content);

  // No phase name — list plan info and available phases
  if (!phaseName) {
    logger.header('myai — Validate');
    logger.info(`Plan: ${plan.name}`);
    logger.info(`Type: ${plan.type}`);
    console.log('');
    if (phases.length > 0) {
      logger.info('Available phases:');
      phases.forEach(p => logger.dim(`  ${p.heading}`));
      console.log('');
      logger.dim('Usage: myai validate "<phase name>"');
      logger.dim('       myai validate "<phase name>" --plan <plan-folder>');
    } else {
      logger.dim('This is a task plan — no phases to validate.');
      logger.dim('Review plan.md directly or run /myai:validate in Claude Code for full AI validation.');
    }
    return;
  }

  const phase = findPhase(phases, phaseName);

  if (!phase) {
    logger.error(`Phase not found: "${phaseName}"`);
    logger.dim('Available phases:');
    phases.forEach(p => logger.dim(`  ${p.heading}`));
    process.exit(1);
  }

  // Output validation context
  logger.header(`myai — Validate: ${phase.heading}`);
  logger.dim(`Plan: ${plan.name}`);
  console.log('');
  console.log(phase.content);
  console.log('');
  logger.dim('─'.repeat(60));
  logger.info('Review the phase above. Validate it matches requirements and is correctly planned.');
}
