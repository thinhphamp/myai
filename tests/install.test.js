import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { install } from '../lib/commands/install.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myai-install-test-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('myai install --claude', () => {
  it('creates .claude/ directory', async () => {
    await install({ claude: true });
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(true);
  });

  it('copies hooks into .claude/', async () => {
    await install({ claude: true });
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'hooks', 'session-init.cjs'))).toBe(true);
  });

  it('copies agents into .claude/', async () => {
    await install({ claude: true });
    const agents = fs.readdirSync(path.join(tmpDir, '.claude', 'agents'));
    expect(agents.length).toBeGreaterThanOrEqual(12);
  });

  it('creates settings.json with hooks', async () => {
    await install({ claude: true });
    const settings = JSON.parse(
      fs.readFileSync(path.join(tmpDir, '.claude', 'settings.json'), 'utf8')
    );
    expect(settings.hooks).toBeDefined();
    expect(settings.hooks.SessionStart).toBeDefined();
    expect(settings.hooks.PreToolUse).toBeDefined();
  });

  it('creates CLAUDE.md in project root', async () => {
    await install({ claude: true });
    expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(true);
  });

  it('does not overwrite existing CLAUDE.md', async () => {
    const claudeMd = path.join(tmpDir, 'CLAUDE.md');
    fs.writeFileSync(claudeMd, 'custom content');
    await install({ claude: true });
    expect(fs.readFileSync(claudeMd, 'utf8')).toBe('custom content');
  });

  it('merges hooks into existing settings.json', async () => {
    const settingsPath = path.join(tmpDir, '.claude', 'settings.json');
    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify({
      includeCoAuthoredBy: true,
      customSetting: 'preserved'
    }, null, 2));

    await install({ claude: true });

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(settings.customSetting).toBe('preserved');
    expect(settings.hooks.SessionStart).toBeDefined();
  });
});

describe('myai install --gemini', () => {
  it('creates GEMINI.md in project root', async () => {
    await install({ gemini: true });
    expect(fs.existsSync(path.join(tmpDir, 'GEMINI.md'))).toBe(true);
  });

  it('GEMINI.md contains expected content', async () => {
    await install({ gemini: true });
    const content = fs.readFileSync(path.join(tmpDir, 'GEMINI.md'), 'utf8');
    expect(content).toContain('GEMINI.md');
    expect(content).toContain('.myai/rules/');
  });
});

describe('myai install --codex', () => {
  it('creates AGENTS.md in project root', async () => {
    await install({ codex: true });
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
  });
});

describe('myai install --all', () => {
  it('installs for all runtimes', async () => {
    await install({ all: true });
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.opencode'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'GEMINI.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
  });
});

describe('myai install (no flags)', () => {
  it('does nothing when no runtime specified', async () => {
    await install({});
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(false);
  });
});
