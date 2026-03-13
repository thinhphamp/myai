import fs from 'fs';
import path from 'path';

const PACKAGE_NAME = '@thinhpham/myai';
const GITHUB_REPO_OWNER = 'thinhpham';
const GITHUB_REPO_NAME = 'myai';
const FETCH_TIMEOUT = 5000;

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Get local installed version from .myai/.version or node_modules
 */
export function getLocalVersion() {
  const cwd = process.cwd();

  const versionFile = path.join(cwd, '.myai', '.version');
  if (fs.existsSync(versionFile)) {
    return {
      version: fs.readFileSync(versionFile, 'utf8').trim(),
      source: '.myai/.version'
    };
  }

  const pkg = readJsonSafe(path.join(cwd, 'node_modules', PACKAGE_NAME, 'package.json'));
  if (pkg?.version) {
    return { version: pkg.version, source: 'node_modules' };
  }

  return null;
}

/**
 * Fetch latest version from GitHub Releases API
 * Uses GITHUB_TOKEN env var if available (no auth required for public repos)
 */
export async function getLatestVersion() {
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'myai-cli'
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT)
    });

    if (!res.ok) return { error: `GitHub API error: ${res.status}` };

    const data = await res.json();
    const version = (data.tag_name || '').replace(/^v/, '');
    if (!version) return { error: 'Could not parse release version.' };
    return { version };
  } catch (error) {
    return { error: error.name === 'AbortError' ? 'Network timeout' : error.message };
  }
}

/**
 * Compare two semver versions
 * @returns {number} -1 outdated, 0 equal, 1 ahead
 */
export function compareVersions(local, latest) {
  const localParts = local.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const l = localParts[i] || 0;
    const r = latestParts[i] || 0;
    if (l < r) return -1;
    if (l > r) return 1;
  }
  return 0;
}
