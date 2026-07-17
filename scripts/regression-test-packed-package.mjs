import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const { stdout } = await execFileAsync('npm', ['pack', '--json'], {
  maxBuffer: 10 * 1024 * 1024,
});
const jsonStart = stdout.indexOf('[\n');
if (jsonStart === -1) {
  throw new Error(`Unable to find npm pack JSON output:\n${stdout}`);
}
const packResult = JSON.parse(stdout.slice(jsonStart));
const tarball = resolve(packResult[0].filename);

try {
  const result = await execFileAsync(process.execPath, ['scripts/regression-test-npm-package.mjs'], {
    env: {
      ...process.env,
      OCPI_REGRESSION_PACKAGE: tarball,
    },
    maxBuffer: 10 * 1024 * 1024,
  });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
} finally {
  await unlink(tarball).catch(() => {});
}
