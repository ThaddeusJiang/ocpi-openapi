import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import YAML from 'yaml';

import { emsClientOperations } from './ems-client-operations.mjs';

const httpMethods = new Set(['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace']);

export const collectSdkOperations = (document, publicOperations) => {
  const discovered = new Map();

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!httpMethods.has(method) || typeof operation?.operationId !== 'string') {
        continue;
      }

      if (discovered.has(operation.operationId)) {
        throw new Error(`Duplicate OpenAPI operationId: ${operation.operationId}`);
      }

      discovered.set(operation.operationId, {
        method: method.toUpperCase(),
        operationId: operation.operationId,
        path,
        summary: operation.summary ?? '',
      });
    }
  }

  const expectedIds = new Set(publicOperations.map(({ operationId }) => operationId));
  const missingIds = publicOperations
    .map(({ operationId }) => operationId)
    .filter((operationId) => !discovered.has(operationId));
  const unexpectedIds = [...discovered.keys()].filter((operationId) => !expectedIds.has(operationId));

  if (missingIds.length > 0) {
    throw new Error(`Missing EMS SDK operations: ${missingIds.join(', ')}`);
  }
  if (unexpectedIds.length > 0) {
    throw new Error(`Unexpected EMS SDK operations: ${unexpectedIds.join(', ')}`);
  }

  return publicOperations.map(({ operationId, sdkMethod }) => ({
    ...discovered.get(operationId),
    sdkMethod,
  }));
};

const escapeTableCell = (value) => String(value || '—').replaceAll('|', '\\|').replaceAll('\n', ' ');

export const renderSdkApi = (operations) => {
  const rows = operations.map(
    ({ method, operationId, path, sdkMethod, summary }) =>
      `| \`${method}\` | \`${path}\` | \`${sdkMethod}\` | \`${operationId}\` | ${escapeTableCell(summary)} |`,
  );

  return [
    '# OCPI TypeScript SDK API',
    '',
    'This file is generated from the EMS OpenAPI document. Do not edit it directly.',
    '',
    `The root \`@thaddeusjiang/ocpi\` package exports ${operations.length} EMSP-side request methods.`,
    '',
    '| HTTP | Path | SDK method | OpenAPI operationId | Summary |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
    'The complete protocol document is available from `@thaddeusjiang/ocpi/openapi.yaml`; the SDK input subset is available from `@thaddeusjiang/ocpi/openapi.ems.yaml`.',
    '',
  ].join('\n');
};

export const generateSdkApi = async ({
  inputPath = 'dist/yaml/openapi.ems.yaml',
  outputPath = 'api.md',
} = {}) => {
  const document = YAML.parse(await readFile(inputPath, 'utf8'));
  const operations = collectSdkOperations(document, emsClientOperations);
  await writeFile(outputPath, renderSdkApi(operations));
};

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (invokedPath === import.meta.url) {
  await generateSdkApi();
}
