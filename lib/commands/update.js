import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { getFileDiff, showDiffPreview } from '../utils/diff-utils.js';
import { promptConflictResolution } from '../utils/prompt-helpers.js';
import { deepMergeJson, backupFile, getPackageRoot, copyDirRecursive } from '../utils/file-operations.js';

export async function update() {
  const targetDir = process.cwd();
  const packageRoot = getPackageRoot();

  logger.header('myai — Update');

  if (!fs.existsSync(path.join(targetDir, '.myai'))) {
    logger.error('.myai/ not found. Run "myai init" first.');
    process.exit(1);
  }

  const conflicts = [];
  const newFiles = [];
  const identical = [];

  for (const relPath of collectFiles(packageRoot)) {
    const localPath = path.join(targetDir, relPath);
    const remotePath = path.join(packageRoot, relPath);
    const diff = getFileDiff(localPath, remotePath);

    if (diff.status === 'new') newFiles.push({ relPath, ...diff });
    else if (diff.status === 'conflict') conflicts.push({ relPath, ...diff });
    else identical.push(relPath);
  }

  logger.info(`Found: ${newFiles.length} new, ${conflicts.length} conflicts, ${identical.length} unchanged`);

  if (conflicts.length === 0 && newFiles.length === 0) {
    logger.success('Already up to date!');
    propagateToRuntimes(targetDir, packageRoot);
    return;
  }

  // Copy new files
  if (newFiles.length > 0) {
    logger.info(`Adding ${newFiles.length} new files...`);
    for (const { relPath, remote } of newFiles) {
      const dest = path.join(targetDir, relPath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, remote);
      logger.success(relPath);
    }
  }

  // Resolve conflicts interactively
  let bulkAction = null;
  const results = { kept: 0, overwritten: 0, merged: 0, backed: 0 };

  for (const { relPath, local, remote } of conflicts) {
    const localPath = path.join(targetDir, relPath);
    const isJson = relPath.endsWith('.json');

    if (!bulkAction) {
      showDiffPreview(relPath, local, remote);
      const action = await promptConflictResolution(relPath, isJson);
      if (action.endsWith('-all')) {
        bulkAction = action.replace('-all', '');
      } else {
        resolveConflict(localPath, remote, action, isJson, results);
        continue;
      }
    }

    resolveConflict(localPath, remote, bulkAction, isJson, results);
  }

  // Update version marker
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  fs.writeFileSync(path.join(targetDir, '.myai', '.version'), pkg.version);

  // Propagate to runtime dirs that already exist in the project
  propagateToRuntimes(targetDir, packageRoot);

  logger.header('Update Complete!');
  logger.info(`Kept: ${results.kept}, Overwritten: ${results.overwritten}, Merged: ${results.merged}, Backed up: ${results.backed}`);
}

function resolveConflict(localPath, remoteContent, action, isJson, results) {
  switch (action) {
    case 'keep':
      results.kept++;
      logger.dim(`${path.basename(localPath)}: kept local`);
      break;
    case 'overwrite':
      fs.writeFileSync(localPath, remoteContent);
      results.overwritten++;
      logger.success(`${path.basename(localPath)}: overwritten`);
      break;
    case 'merge':
      if (isJson) {
        try {
          const merged = deepMergeJson(localPath, remoteContent);
          fs.writeFileSync(localPath, JSON.stringify(merged, null, 2));
          results.merged++;
          logger.success(`${path.basename(localPath)}: merged`);
        } catch (e) {
          fs.writeFileSync(localPath, remoteContent);
          results.overwritten++;
          logger.warning(`${path.basename(localPath)}: merge failed, overwritten`);
        }
      } else {
        fs.writeFileSync(localPath, remoteContent);
        results.overwritten++;
      }
      break;
    case 'backup':
      const backupPath = backupFile(localPath);
      fs.writeFileSync(localPath, remoteContent);
      results.backed++;
      logger.success(`${path.basename(localPath)}: backed up → ${path.basename(backupPath)}`);
      break;
  }
}

/**
 * Sync updated .myai/ contents into runtime config dirs that already exist.
 * Only propagates subdirs that Claude Code / OpenCode read from (commands, agents, skills, rules, hooks).
 * Does not overwrite settings.json or user-owned files.
 */
function propagateToRuntimes(targetDir, packageRoot) {
  const myaiSrc = path.join(packageRoot, '.myai');
  const subdirs = ['commands', 'agents', 'skills', 'rules', 'hooks'];

  // Claude Code: .claude/
  const claudeDir = path.join(targetDir, '.claude');
  if (fs.existsSync(claudeDir)) {
    let synced = 0;
    for (const sub of subdirs) {
      const src = path.join(myaiSrc, sub);
      const dest = path.join(claudeDir, sub);
      if (fs.existsSync(src)) {
        const result = copyDirRecursive(src, dest, false); // overwrite=true
        synced += result.copied;
      }
    }
    if (synced > 0) logger.success(`.claude/ — ${synced} files synced`);
  }

  // OpenCode: .opencode/
  const opencodeDir = path.join(targetDir, '.opencode');
  if (fs.existsSync(opencodeDir)) {
    let synced = 0;
    for (const sub of subdirs) {
      const src = path.join(myaiSrc, sub);
      const dest = path.join(opencodeDir, sub);
      if (fs.existsSync(src)) {
        const result = copyDirRecursive(src, dest, false);
        synced += result.copied;
      }
    }
    if (synced > 0) logger.success(`.opencode/ — ${synced} files synced`);
  }
}

function collectFiles(packageRoot) {
  const files = [];
  // System files that get synced on update (docs/ and plans/templates/ are user-owned, skip)
  for (const dir of ['.myai']) {
    const dirPath = path.join(packageRoot, dir);
    if (fs.existsSync(dirPath)) walkDir(dirPath, packageRoot, files);
  }
  return files;
}

function walkDir(dir, base, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.venv' || entry.name === 'node_modules' || entry.name === '.version') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, base, files);
    else files.push(path.relative(base, full));
  }
}
