import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { emsClientOperations } from './ems-client-operations.mjs';

const execFileAsync = promisify(execFile);
const packageSpec = process.env.OCPI_REGRESSION_PACKAGE ?? '@thaddeusjiang/ocpi@next';
const workdir = await mkdtemp(join(tmpdir(), 'ocpi-npm-regression-'));
const expectedSdkMethods = emsClientOperations.map(({ sdkMethod }) => sdkMethod).sort();

const run = async (command, args, options = {}) => {
  await execFileAsync(command, args, {
    cwd: workdir,
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
};

try {
  await writeFile(
    join(workdir, 'package.json'),
    JSON.stringify(
      {
        private: true,
        scripts: {
          typecheck: 'tsc --noEmit',
        },
        dependencies: {
          '@types/node': '26.1.1',
          typescript: '6.0.3',
        },
        devDependencies: {},
      },
      null,
      2,
    ),
  );

  await writeFile(
    join(workdir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          module: 'Node16',
          moduleResolution: 'Node16',
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: 'ES2022',
          types: ['node'],
        },
        include: ['index.ts'],
      },
      null,
      2,
    ),
  );

  await writeFile(
    join(workdir, 'index.ts'),
    [
      "import { getLocations, getVersions, putToken, type Location, type Token } from '@thaddeusjiang/ocpi';",
      "import { client } from '@thaddeusjiang/ocpi/client';",
      "import type { Credentials, VersionDetail } from '@thaddeusjiang/ocpi/types';",
      '',
      "client.setConfig({ baseUrl: 'https://ocpi.example.test/2.2.1', auth: 'Token regression-token' });",
      '',
      'const location: Location = {',
      "  country_code: 'JP',",
      "  party_id: 'EMS',",
      "  id: 'LOC1',",
      '  publish: true,',
      "  address: '1 Marunouchi',",
      "  city: 'Tokyo',",
      "  country: 'JPN',",
      "  coordinates: { latitude: '35.68123', longitude: '139.76712' },",
      "  time_zone: 'Asia/Tokyo',",
      "  last_updated: '2015-06-29T20:39:09Z',",
      '};',
      '',
      'const token: Token = {',
      "  country_code: 'JP',",
      "  party_id: 'EMS',",
      "  uid: 'TOKEN1',",
      "  type: 'RFID',",
      "  contract_id: 'JP-EMS-C123456',",
      "  issuer: 'EMS',",
      '  valid: true,',
      "  whitelist: 'ALLOWED',",
      "  last_updated: '2015-06-29T20:39:09Z',",
      '};',
      '',
      "const credentials: Credentials = { token: 'receiver-token', url: 'https://ocpi.example.test/2.2.1' };",
      "const detail: VersionDetail = { version: '2.2.1', endpoints: [] };",
      '',
      'void location;',
      'void credentials;',
      'void detail;',
      'void getVersions();',
      'void getLocations({ query: { limit: 1 } });',
      "void putToken({ body: token, path: { country_code: 'JP', party_id: 'EMS', token_uid: 'TOKEN1' }, query: { type: 'RFID' } });",
      '',
    ].join('\n'),
  );

  const runtimeAssertions = [
    `const expectedMethods = ${JSON.stringify(expectedSdkMethods)};`,
    "const actualMethods = Object.entries(ocpi).filter(([, value]) => typeof value === 'function').map(([name]) => name).sort();",
    "if (JSON.stringify(actualMethods) !== JSON.stringify(expectedMethods)) throw new Error(`Unexpected SDK methods: ${actualMethods.join(', ')}`);",
    "if (!client || typeof client.setConfig !== 'function') throw new Error('client.setConfig missing');",
    "for (const [resolvedPath, suffix] of publicFiles) if (!resolvedPath.endsWith(suffix)) throw new Error(`${suffix} export missing`);",
    "const apiContents = readFileSync(apiReference, 'utf8');",
    "for (const method of expectedMethods) if (!apiContents.includes('`' + method + '`')) throw new Error(`${method} missing from api.md`);",
  ];

  await writeFile(
    join(workdir, 'runtime-commonjs.cjs'),
    [
      "const { readFileSync } = require('node:fs');",
      "const ocpi = require('@thaddeusjiang/ocpi');",
      "const { client } = require('@thaddeusjiang/ocpi/client');",
      "const apiReference = require.resolve('@thaddeusjiang/ocpi/api.md');",
      "const publicFiles = [",
      "  [apiReference, 'api.md'],",
      "  [require.resolve('@thaddeusjiang/ocpi/openapi.yaml'), 'openapi.yaml'],",
      "  [require.resolve('@thaddeusjiang/ocpi/openapi.ems.yaml'), 'openapi.ems.yaml'],",
      "  [require.resolve('@thaddeusjiang/ocpi/types'), 'types.gen.js'],",
      '];',
      ...runtimeAssertions,
      "console.log(JSON.stringify({ module: 'commonjs', ok: true }));",
    ].join('\n'),
  );

  await writeFile(
    join(workdir, 'runtime-esm.mjs'),
    [
      "import { readFileSync } from 'node:fs';",
      "import { createRequire } from 'node:module';",
      "import * as ocpi from '@thaddeusjiang/ocpi';",
      "import { client } from '@thaddeusjiang/ocpi/client';",
      "const require = createRequire(import.meta.url);",
      "const apiReference = require.resolve('@thaddeusjiang/ocpi/api.md');",
      "const publicFiles = [",
      "  [apiReference, 'api.md'],",
      "  [require.resolve('@thaddeusjiang/ocpi/openapi.yaml'), 'openapi.yaml'],",
      "  [require.resolve('@thaddeusjiang/ocpi/openapi.ems.yaml'), 'openapi.ems.yaml'],",
      "  [require.resolve('@thaddeusjiang/ocpi/types'), 'types.gen.js'],",
      '];',
      ...runtimeAssertions,
      "console.log(JSON.stringify({ module: 'esm', ok: true }));",
    ].join('\n'),
  );

  await run('npm', ['install', '--ignore-scripts', packageSpec]);
  await run('npm', ['run', 'typecheck']);

  for (const runtime of ['runtime-commonjs.cjs', 'runtime-esm.mjs']) {
    const { stdout } = await execFileAsync(process.execPath, [runtime], { cwd: workdir });
    process.stdout.write(stdout);
  }
} finally {
  await rm(workdir, { force: true, recursive: true });
}
