/**
 * File Operations Utility
 *
 * Provides reusable functions for file and directory operations
 * used by CLI commands (init, update, etc.).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { merge } from 'lodash-es';

/**
 * Get the package root directory when running as CLI
 * @returns {string} Absolute path to package root
 */
export function getPackageRoot() {
  const binDir = dirname(fileURLToPath(import.meta.url));
  return path.resolve(binDir, '..', '..');
}

/**
 * Copy directory recursively with skip-existing logic
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 * @param {boolean} skipExisting - Skip files that already exist in destination
 * @returns {{copied: number, skipped: number}} Statistics about copy operation
 */
export function copyDirRecursive(src, dest, skipExisting = true) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip .venv and node_modules directories
    if (entry.name === '.venv' || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      const result = copyDirRecursive(srcPath, destPath, skipExisting);
      copied += result.copied;
      skipped += result.skipped;
    } else {
      if (!fs.existsSync(destPath) || !skipExisting) {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      } else {
        skipped++;
      }
    }
  }

  return { copied, skipped };
}

/**
 * Copy a single file with optional skip-existing logic
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @param {boolean} skipExisting - Skip if destination exists
 * @returns {{copied: boolean, reason?: string}} Result of copy operation
 */
export function copyFile(src, dest, skipExisting = true) {
  if (fs.existsSync(dest) && skipExisting) {
    return { copied: false, reason: 'exists' };
  }
  fs.copyFileSync(src, dest);
  return { copied: true };
}

/**
 * Deep merge local JSON file with remote JSON content
 * @param {string} localPath - Path to local JSON file
 * @param {string} remoteContent - JSON content string from package
 * @returns {object} Merged JSON object
 */
export function deepMergeJson(localPath, remoteContent) {
  const local = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  const remote = JSON.parse(remoteContent);
  return merge({}, local, remote);
}

/**
 * Create a timestamped backup of a file
 * @param {string} filePath - Path to file to backup
 * @returns {string} Path to backup file
 * @throws {Error} If backup cannot be created
 */
export function backupFile(filePath) {
  const backupPath = `${filePath}.backup-${Date.now()}`;
  try {
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    throw new Error(`Failed to create backup of ${filePath}: ${error.message}`);
  }
}
