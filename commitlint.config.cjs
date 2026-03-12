module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // New feature
      'fix',      // Bug fix
      'docs',     // Documentation
      'style',    // Formatting
      'refactor', // Code refactoring
      'perf',     // Performance
      'test',     // Tests
      'build',    // Build system
      'ci',       // CI config
      'chore',    // Maintenance
      'revert'    // Revert commit
    ]],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'body-max-line-length': [0, 'never'] // Disable line length limit for release notes
  }
};
