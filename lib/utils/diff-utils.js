/**
 * Diff Utilities
 *
 * Provides file comparison and diff preview functionality
 * for the interactive update command.
 */

import fs from 'fs';
import { logger } from './logger.js';

/**
 * Compare local and remote file contents
 * @param {string} localPath - Path to local file
 * @param {string} remotePath - Path to remote/package file
 * @returns {{status: string, local: string|null, remote: string|null}}
 */
export function getFileDiff(localPath, remotePath) {
  const local = fs.existsSync(localPath)
    ? fs.readFileSync(localPath, 'utf8')
    : null;
  const remote = fs.existsSync(remotePath)
    ? fs.readFileSync(remotePath, 'utf8')
    : null;

  if (local === null) return { status: 'new', local, remote };
  if (remote === null) return { status: 'deleted', local, remote };
  if (local === remote) return { status: 'identical', local, remote };
  return { status: 'conflict', local, remote };
}

/**
 * Display a preview of file differences
 * @param {string} filePath - Relative file path for display
 * @param {string} local - Local file content
 * @param {string} remote - Remote file content
 */
export function showDiffPreview(filePath, local, remote) {
  logger.dim(`\n--- ${filePath} (local)`);
  logger.dim(`+++ ${filePath} (package)\n`);

  const localLines = (local || '').split('\n').slice(0, 10);
  const remoteLines = (remote || '').split('\n').slice(0, 10);

  logger.dim('Local (first 10 lines):');
  localLines.forEach(l => console.log(`  ${l}`));

  logger.dim('\nPackage (first 10 lines):');
  remoteLines.forEach(l => console.log(`  ${l}`));

  if (local && local.split('\n').length > 10) {
    logger.dim(`\n... ${local.split('\n').length - 10} more lines`);
  }
}
