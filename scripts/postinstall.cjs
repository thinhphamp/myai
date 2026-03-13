#!/usr/bin/env node
/**
 * postinstall.cjs
 *
 * Runs automatically after `npm install @thinhpham/myai`.
 * Copies .myai/ system into the consumer project's .claude/ directory
 * so the hooks and agents are available immediately.
 *
 * Skips if:
 *   - Global install (user ran npm install -g)
 *   - Installing inside the package itself (development mode)
 *   - Already installed (.claude/.myai-version exists and is current)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

const packageRoot = path.resolve(__dirname, '..');
const projectRoot = process.env.INIT_CWD || path.resolve(packageRoot, '..', '..');

// Skip global installs
if (process.env.npm_config_global === 'true') {
  log('Skipping postinstall: global install. Run "myai install --claude" manually.', 'dim');
  process.exit(0);
}

// Skip if installing inside the package itself (development)
const projectPkgPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(projectPkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf8'));
    if (pkg.name === '@thinhpham/myai') {
      log('Skipping postinstall: installing inside the package itself.', 'dim');
      process.exit(0);
    }
  } catch (_) { /* ignore */ }
}

// Skip if packageRoot === projectRoot
if (packageRoot === projectRoot) {
  log('Skipping postinstall: package root equals project root.', 'dim');
  process.exit(0);
}

log('myai: installing .myai/ system...', 'cyan');

const myaiSrc = path.join(packageRoot, '.myai');
const claudeDest = path.join(projectRoot, '.claude');

// Copy .myai/ → .claude/ (skip-existing to preserve user customizations)
function copyDirChanges(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  let copied = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.venv' || entry.name === 'node_modules') continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copied += copyDirChanges(srcPath, destPath);
    } else {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
  }

  return copied;
}

try {
  const copied = copyDirChanges(myaiSrc, claudeDest);

  // Write version marker
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  fs.writeFileSync(path.join(claudeDest, '.version'), pkg.version + '\n');

  if (copied > 0) {
    log(`✓ Installed ${copied} files to .claude/`, 'green');
  } else {
    log('✓ myai already up to date', 'dim');
  }

  log('  Run "myai install --claude" to update hooks in settings.json', 'dim');
} catch (err) {
  // Non-fatal — postinstall should never block npm install
  log(`Warning: myai postinstall failed: ${err.message}`, 'yellow');
  log('  Run "myai install --claude" manually to complete setup.', 'dim');
}
