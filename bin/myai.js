#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { init } from '../lib/commands/init.js';
import { update } from '../lib/commands/update.js';
import { install } from '../lib/commands/install.js';
import { validate } from '../lib/commands/validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

const program = new Command();

program
  .name('myai')
  .description('Meta-prompting, context engineering, and spec-driven development')
  .version(pkg.version, '-v, --version', 'Display version number');

program
  .command('init')
  .description('Initialize myai in current project (installs .myai/ + docs/ templates)')
  .option('--claude', 'Also install for Claude Code (.claude/)')
  .option('--opencode', 'Also install for OpenCode (.opencode/)')
  .option('--gemini', 'Also install for Gemini CLI (GEMINI.md)')
  .option('--codex', 'Also install for Codex (AGENTS.md)')
  .option('--all', 'Also install for all runtimes')
  .option('--global', 'Install globally (user-level config dirs)')
  .action(init);

program
  .command('update')
  .description('Update myai configuration with interactive merge')
  .action(update);

program
  .command('install')
  .description('Install myai for specific AI runtimes')
  .option('--claude', 'Install for Claude Code')
  .option('--opencode', 'Install for OpenCode')
  .option('--gemini', 'Install for Gemini CLI')
  .option('--codex', 'Install for Codex')
  .option('--all', 'Install for all runtimes')
  .option('--global', 'Install globally (user-level config dirs)')
  .action(install);

program
  .command('validate [phase]')
  .description('Validate a plan phase against requirements')
  .option('--plan <name>', 'Plan folder name (defaults to latest)')
  .action(validate);

program.on('command:*', (operands) => {
  console.error(`error: unknown command '${operands[0]}'`);
  console.log('Run "myai --help" for usage information.');
  process.exit(1);
});

program.parse();
