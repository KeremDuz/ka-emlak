import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
const [task = 'dev', ...args] = process.argv.slice(2);
const [major, minor] = process.versions.node.split('.').map(Number);
const bundled = join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin', process.platform === 'win32' ? 'node.exe' : 'node');
const executable = major > 24 || (major === 24 && minor >= 12) ? process.execPath : existsSync(bundled) ? bundled : process.execPath;
const commands = { dev: ['astro/bin/astro.mjs', 'dev'], build: ['astro/bin/astro.mjs', 'build'], check: ['@astrojs/check/bin/astro-check.js'], test: ['vitest/vitest.mjs', 'run'], preview: ['wrangler/bin/wrangler.js', 'dev'] };
if (!(task in commands)) throw new Error('Unknown task');
const [file, ...flags] = commands[task];
const child = spawn(executable, [join(process.cwd(), 'node_modules', file), ...flags, ...args], {
  stdio: 'inherit', env: { ...process.env, ...(task === 'build' ? { KA_BUILD_TARGET: 'cloudflare' } : {}) },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
