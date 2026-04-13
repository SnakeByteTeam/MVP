import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const isIntegrationCoverageRun = args.some(
  (arg) => arg === 'integration' || arg.includes('integration'),
);
const isE2ECoverageRun = args.some(
  (arg) => arg === 'e2e' || arg.includes('e2e'),
);

const jestArgs = ['--coverage', ...args];

if (isE2ECoverageRun) {
  jestArgs.unshift('--config', './test/jest-e2e.json');
} else if (isIntegrationCoverageRun) {
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
