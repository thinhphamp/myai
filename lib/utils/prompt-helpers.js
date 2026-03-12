/**
 * Prompt Helpers
 *
 * Provides Inquirer.js-based interactive prompts
 * for conflict resolution and user confirmation.
 */

import inquirer from 'inquirer';

/**
 * Prompt user for conflict resolution action
 * @param {string} filePath - Path to file with conflict
 * @param {boolean} isJson - Whether file is JSON (merge option available)
 * @returns {Promise<string>} Selected action
 */
export async function promptConflictResolution(filePath, isJson) {
  const choices = [
    { name: 'Keep local version', value: 'keep' },
    { name: 'Use package version (overwrite)', value: 'overwrite' },
    { name: 'Backup local + use package', value: 'backup' }
  ];

  if (isJson) {
    choices.splice(2, 0, {
      name: 'Merge (deep merge JSON)',
      value: 'merge'
    });
  }

  choices.push(
    new inquirer.Separator(),
    { name: 'Keep ALL remaining local files', value: 'keep-all' },
    { name: 'Overwrite ALL remaining files', value: 'overwrite-all' }
  );

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `Conflict in ${filePath}:`,
      choices
    }
  ]);

  return action;
}

/**
 * Confirm before proceeding with update
 * @param {number} fileCount - Number of files to update
 * @returns {Promise<boolean>} User's confirmation
 */
export async function confirmUpdate(fileCount) {
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: `Found ${fileCount} files to update. Proceed?`,
      default: true
    }
  ]);
  return proceed;
}
