import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const isIntegrationCoverageRun = args.some(
  (arg) => arg === 'integration' || arg.includes('integration'),
);

const jestArgs = ['--coverage', ...args];

if (isIntegrationCoverageRun) {
  jestArgs.unshift('--config', './jest.integration.coverage.json');
}

const result = spawnSync('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
