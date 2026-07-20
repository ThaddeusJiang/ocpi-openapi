import { describe, expect, it } from 'vitest';

import { collectSdkOperations, renderSdkApi } from '../scripts/generate-sdk-api.mjs';

const document = {
  paths: {
    '/versions': {
      parameters: [],
      get: {
        operationId: 'getVersions',
        summary: 'List versions',
      },
    },
    '/locations': {
      get: {
        operationId: 'getLocations',
        summary: 'List locations | paginated',
      },
    },
  },
};

describe('collectSdkOperations', () => {
  it('uses the public SDK operation order and ignores path metadata', () => {
    expect(
      collectSdkOperations(document, [
        { operationId: 'getLocations', sdkMethod: 'getLocations' },
        { operationId: 'getVersions', sdkMethod: 'getVersions' },
      ]),
    ).toEqual([
      {
        method: 'GET',
        operationId: 'getLocations',
        path: '/locations',
        sdkMethod: 'getLocations',
        summary: 'List locations | paginated',
      },
      {
        method: 'GET',
        operationId: 'getVersions',
        path: '/versions',
        sdkMethod: 'getVersions',
        summary: 'List versions',
      },
    ]);
  });

  it('fails when the OpenAPI subset and public SDK contract drift apart', () => {
    expect(() =>
      collectSdkOperations(document, [
        { operationId: 'getVersions', sdkMethod: 'getVersions' },
        { operationId: 'missingOperation', sdkMethod: 'missingOperation' },
      ]),
    ).toThrow('Missing EMS SDK operations: missingOperation');
  });

  it('rejects operations that are not part of the public SDK contract', () => {
    expect(() =>
      collectSdkOperations(document, [{ operationId: 'getVersions', sdkMethod: 'getVersions' }]),
    ).toThrow('Unexpected EMS SDK operations: getLocations');
  });
});

describe('renderSdkApi', () => {
  it('renders a deterministic Markdown API reference', () => {
    const operations = collectSdkOperations(document, [
      { operationId: 'getLocations', sdkMethod: 'getLocations' },
      { operationId: 'getVersions', sdkMethod: 'getVersions' },
    ]);

    expect(renderSdkApi(operations)).toContain(
      '| `GET` | `/locations` | `getLocations` | `getLocations` | List locations \\| paginated |',
    );
    expect(renderSdkApi(operations)).toContain('This file is generated from the EMS OpenAPI document.');
  });
});
