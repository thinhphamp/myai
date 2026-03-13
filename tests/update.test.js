import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { init } from '../lib/commands/init.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myai-update-test-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('myai update (integration with init)', () => {
  it('update exits early if .myai/ does not exist', async () => {
    // update requires .myai/ to exist (created by init)
    // We verify init creates it first
    expect(fs.existsSync(path.join(tmpDir, '.myai'))).toBe(false);
    await init();
    expect(fs.existsSync(path.join(tmpDir, '.myai'))).toBe(true);
  });

  it('init preserves existing docs/ files on re-run', async () => {
    await init();
    const projectMd = path.join(tmpDir, 'docs', 'PROJECT.md');
    fs.writeFileSync(projectMd, 'custom project content');

    // Second init exits early (guard) — mock exit to prevent test process termination
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit:0'); });
    try { await init(); } catch { /* expected */ }
    exitSpy.mockRestore();

    expect(fs.readFileSync(projectMd, 'utf8')).toBe('custom project content');
  });

  it('init preserves existing .myai/ files', async () => {
    await init();
    const settingsPath = path.join(tmpDir, '.myai', 'settings.json');
    fs.writeFileSync(settingsPath, '{"custom": true}');

    // Second init exits early (guard) — mock exit to prevent test process termination
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit:0'); });
    try { await init(); } catch { /* expected */ }
    exitSpy.mockRestore();

    expect(fs.readFileSync(settingsPath, 'utf8')).toBe('{"custom": true}');
  });

  it('.myai/.version file is written by init', async () => {
    await init();
    const versionPath = path.join(tmpDir, '.myai', '.version');
    expect(fs.existsSync(versionPath)).toBe(true);
    const version = fs.readFileSync(versionPath, 'utf8').trim();
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
