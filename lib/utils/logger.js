/**
 * Logger Utility
 *
 * Provides colored console output using chalk for CLI messages.
 * Supports info, success, warning, error, dim, and header styles.
 */

import chalk from 'chalk';

export const logger = {
  info: (msg) => console.log(chalk.cyan(msg)),
  success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
  error: (msg) => console.error(chalk.red(`✖ ${msg}`)),
  dim: (msg) => console.log(chalk.dim(msg)),
  header: (msg) => console.log(chalk.bold.blue(`\n${msg}\n`))
};
