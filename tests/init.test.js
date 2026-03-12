import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { init } from '../lib/commands/init.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myai-init-test-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('myai init', () => {
  it('creates .myai/ directory', async () => {
    await init();
    expect(fs.existsSync(path.join(tmpDir, '.myai'))).toBe(true);
  });

  it('copies settings.json', async () => {
    await init();
    expect(fs.existsSync(path.join(tmpDir, '.myai', 'settings.json'))).toBe(true);
  });

  it('copies hooks directory', async () => {
    await init();
    expect(fs.existsSync(path.join(tmpDir, '.myai', 'hooks'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.myai', 'hooks', 'session-init.cjs'))).toBe(true);
  });

  it('copies agents directory with all 12 agents', async () => {
    await init();
    const agents = fs.readdirSync(path.join(tmpDir, '.myai', 'agents'));
    expect(agents.length).toBeGreaterThanOrEqual(12);
  });

  it('copies commands directory with all 8 commands', async () => {
    await init();
    const commands = fs.readdirSync(path.join(tmpDir, '.myai', 'commands'));
    expect(commands.length).toBeGreaterThanOrEqual(8);
  });

  it('copies skills directory', async () => {
    await init();
    const skills = fs.readdirSync(path.join(tmpDir, '.myai', 'skills'));
    expect(skills.length).toBeGreaterThan(0);
  });

  it('creates docs/ templates', async () => {
    await init();
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'PROJECT.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'SPEC.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'ROADMAP.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'docs', 'STATE.md'))).toBe(true);
  });

  it('creates plans/templates/', async () => {
    await init();
    expect(fs.existsSync(path.join(tmpDir, 'plans', 'templates'))).toBe(true);
  });

  it('writes .myai/.version file', async () => {
    await init();
    expect(fs.existsSync(path.join(tmpDir, '.myai', '.version'))).toBe(true);
  });

  it('exits early if .myai/ already exists', async () => {
    await init();
    const firstMtime = fs.statSync(path.join(tmpDir, '.myai', 'settings.json')).mtimeMs;
    // Mock process.exit so the second init() call doesn't terminate the test process
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit:0'); });
    try {
      await init();
    } catch (e) {
      expect(e.message).toBe('process.exit:0');
    }
    exitSpy.mockRestore();
    const secondMtime = fs.statSync(path.join(tmpDir, '.myai', 'settings.json')).mtimeMs;
    expect(firstMtime).toBe(secondMtime);
  });
});
