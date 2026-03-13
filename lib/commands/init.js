import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import { copyDirRecursive, copyFile, getPackageRoot } from '../utils/file-operations.js';
import { getLocalVersion, getLatestVersion, compareVersions } from '../utils/version-checker.js';
import { install } from './install.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function init(options = {}) {
  const targetDir = process.cwd();
  const packageRoot = getPackageRoot();

  logger.header('myai — Init');

  // Guard: already initialized
  const myaiDir = path.join(targetDir, '.myai');
  if (fs.existsSync(myaiDir)) {
    logger.warning('.myai/ already exists');
    logger.info('Run "myai update" to merge latest changes');
    process.exit(0);
  }

  // Copy .myai/ system
  const srcTpaiDir = path.join(packageRoot, '.myai');
  if (!fs.existsSync(srcTpaiDir)) {
    logger.error('Source .myai/ directory not found in package');
    logger.dim('Re-install myai: npm install -g @thinhpham/myai');
    process.exit(1);
  }

  logger.info('Installing .myai/ system...');
  const myaiResult = copyDirRecursive(srcTpaiDir, myaiDir);
  logger.success(`.myai/ — ${myaiResult.copied} files`);

  // Write version marker
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  fs.writeFileSync(path.join(myaiDir, '.version'), pkg.version);
  logger.dim(`Version: ${pkg.version}`);

  // Install docs/ brain layer (skip existing files — never overwrite user's docs)
  const docsTemplatesDir = path.join(packageRoot, 'docs-templates');
  const docsDir = path.join(targetDir, 'docs');

  if (fs.existsSync(docsTemplatesDir)) {
    logger.info('Installing docs/ brain layer...');
    fs.mkdirSync(docsDir, { recursive: true });

    const docFiles = fs.readdirSync(docsTemplatesDir);
    let docsCreated = 0;
    let docsSkipped = 0;

    for (const file of docFiles) {
      const src = path.join(docsTemplatesDir, file);
      const dest = path.join(docsDir, file);
      const result = copyFile(src, dest, true); // skipExisting = true
      if (result.copied) {
        logger.success(`docs/${file}`);
        docsCreated++;
      } else {
        logger.dim(`docs/${file} exists (skipped)`);
        docsSkipped++;
      }
    }

    if (docsSkipped > 0) {
      logger.dim(`${docsSkipped} existing doc files preserved`);
    }
  }

  // Install plans/ templates
  const plansTemplatesDir = path.join(packageRoot, 'plans-templates');
  const plansTemplatesDest = path.join(targetDir, 'plans', 'templates');

  if (fs.existsSync(plansTemplatesDir)) {
    logger.info('Installing plans/templates/...');
    const plansResult = copyDirRecursive(plansTemplatesDir, plansTemplatesDest);
    logger.success(`plans/templates/ — ${plansResult.copied} files`);
  }

  // Create plans/ directory
  fs.mkdirSync(path.join(targetDir, 'plans'), { recursive: true });

  // Run install if runtime flags were passed
  const { claude, opencode, gemini, codex, cursor, all, global: isGlobal } = options;
  const hasRuntime = claude || opencode || gemini || codex || cursor || all;
  if (hasRuntime) {
    logger.info('');
    await install({ claude, opencode, gemini, codex, cursor, all, global: isGlobal });
  }

  // Success
  logger.header('Setup Complete!');
  logger.info('Next steps:');
  if (!hasRuntime) {
    logger.dim('  1. Run "myai install --claude" to activate hooks and agents');
    logger.dim('  2. Run /myai:new-project in Claude Code to set up project docs');
  } else {
    logger.dim('  1. Open Claude Code in this project');
    logger.dim('  2. Run /myai:new-project to set up project docs');
  }
  logger.dim('');
  logger.dim('  Commands available:');
  logger.dim('    /myai:new-project  — initialize project docs');
  logger.dim('    /myai:plan         — create a feature plan');
  logger.dim('    /myai:cook         — execute a plan');
  logger.dim('    /myai:progress     — check project status');
  logger.dim('    /myai:pause        — save session state');
  logger.dim('    /myai:resume       — restore session context');

  // Version update check (non-blocking)
  try {
    const local = getLocalVersion();
    const { version: latest } = await getLatestVersion();
    if (local && latest && compareVersions(local.version, latest) < 0) {
      logger.warning(`Update available: ${local.version} → ${latest}`);
      logger.dim('  npm install -g @thinhpham/myai');
    }
  } catch {
    // non-critical
  }
}
