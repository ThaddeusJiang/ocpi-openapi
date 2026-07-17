import { readFile, writeFile } from 'node:fs/promises';

import YAML from 'yaml';

import { emsClientOperationIds } from './ems-client-operations.mjs';

const inputPath = 'dist/yaml/openapi.yaml';
const outputPath = 'dist/yaml/openapi.ems.yaml';
const httpMethods = new Set(['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace']);
const emsOperations = new Set(emsClientOperationIds);

const document = YAML.parse(await readFile(inputPath, 'utf8'));
const filteredPaths = {};

for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
  const filteredPathItem = {};

  for (const [key, value] of Object.entries(pathItem)) {
    if (!httpMethods.has(key)) {
      filteredPathItem[key] = value;
      continue;
    }

    if (emsOperations.has(value?.operationId)) {
      filteredPathItem[key] = value;
    }
  }

  if (Object.keys(filteredPathItem).some((key) => httpMethods.has(key))) {
    filteredPaths[path] = filteredPathItem;
  }
}

document.info = {
  ...document.info,
  description: `${document.info?.description ?? 'OpenAPI definitions for OCPI 2.2.1-d2.'}\n\nThis EMS client subset only includes operations called by an EMSP backend.`,
  title: `${document.info?.title ?? 'OCPI'} EMS Client`,
};
document.paths = filteredPaths;

await writeFile(outputPath, YAML.stringify(document, { lineWidth: 0 }));

