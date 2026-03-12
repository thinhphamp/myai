/**
 * build-hooks.js
 * Validates that all expected hook files are present in .myai/hooks/
 * Hooks are plain CJS — no compilation needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const hooksDir = path.join(__dirname, '..', '.myai', 'hooks');

const REQUIRED_HOOKS = [
  'session-init.cjs',
  'dev-rules-reminder.cjs',
  'privacy-block.cjs',
  'post-edit-simplify-reminder.cjs',
  'usage-context-awareness.cjs'
];

const REQUIRED_LIB = [
  'myai-config.cjs',
  'colors.cjs',
  'context-builder.cjs',
  'privacy-checker.cjs',
  'project-detector.cjs',
  'scout-checker.cjs'
];

let ok = true;

for (const hook of REQUIRED_HOOKS) {
  const p = path.join(hooksDir, hook);
  if (!fs.existsSync(p)) {
    console.error(`Missing hook: .myai/hooks/${hook}`);
    ok = false;
  }
}

for (const lib of REQUIRED_LIB) {
  const p = path.join(hooksDir, 'lib', lib);
  if (!fs.existsSync(p)) {
    console.error(`Missing lib: .myai/hooks/lib/${lib}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log(`Hooks validated: ${REQUIRED_HOOKS.length} hooks, ${REQUIRED_LIB.length} lib files`);
