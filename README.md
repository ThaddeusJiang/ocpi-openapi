# OCPI OpenAPI & TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@thaddeusjiang/ocpi.svg)](https://www.npmjs.com/package/@thaddeusjiang/ocpi)
![Generated SDK coverage](docs/coverage.svg)

OpenAPI 3.1 definitions for OCPI 2.2.1-d2 and the generated `@thaddeusjiang/ocpi` TypeScript SDK.

The complete OpenAPI definition is the source of truth for the protocol reference. The published SDK intentionally exposes only the 23 request methods used by an e-Mobility Service Provider (EMSP); it does not expose the CPO-side operation surface.

- [OpenAPI reference](https://thaddeusjiang.github.io/ocpi/)
- [SDK API reference](api.md)
- [npm package](https://www.npmjs.com/package/@thaddeusjiang/ocpi)

## Installation

```sh
npm install @thaddeusjiang/ocpi
```

## Quick Start

Configure the generated client with the OCPI endpoint and authorization header expected by your counterparty:

```ts
import { getVersions } from '@thaddeusjiang/ocpi';
import { client } from '@thaddeusjiang/ocpi/client';

client.setConfig({
  baseUrl: 'https://ocpi.example.com/2.2.1',
  auth: 'Token your-ocpi-token',
});

const { data, error, response } = await getVersions();

if (error) {
  throw new Error(`OCPI request failed with status ${response?.status}`);
}

console.log(data?.data);
```

By default, request methods return the parsed `data`, parsed `error`, and native `response`. Configure `throwOnError: true` on the client or an individual request when exception-based handling is preferable.

## SDK Usage

All request methods are exported from the package root. Client configuration and generated OCPI types also have stable subpath exports:

```ts
import { getLocations } from '@thaddeusjiang/ocpi';
import { client } from '@thaddeusjiang/ocpi/client';
import type { Location } from '@thaddeusjiang/ocpi/types';

client.setConfig({
  baseUrl: 'https://ocpi.example.com/2.2.1',
  auth: 'Token your-ocpi-token',
});

const result = await getLocations({
  query: {
    limit: 100,
    offset: 0,
  },
});

const locations: Location[] = result.data?.data ?? [];
const nextPage = result.response?.headers.get('Link');
```

The generated client returns one collection page at a time. Use the OCPI `Link`, `X-Total-Count`, and `X-Limit` response headers to continue pagination.

See [api.md](api.md) for the complete SDK method-to-OpenAPI operation mapping.

## OpenAPI Documents

The repository and npm package provide two OpenAPI documents:

| Document | Scope | npm package export |
| --- | --- | --- |
| `openapi/openapi.yaml` | Complete modeled OCPI 2.2.1-d2 protocol | `@thaddeusjiang/ocpi/openapi.yaml` |
| `dist/yaml/openapi.ems.yaml` | EMSP subset used to generate the SDK | `@thaddeusjiang/ocpi/openapi.ems.yaml` |

Browse the complete document in the [hosted OpenAPI reference](https://thaddeusjiang.github.io/ocpi/).

To run a dynamic mock server from the complete OpenAPI document:

```sh
npm ci
npm run mock
```

The mock server listens on `http://127.0.0.1:4010`.

## Compatibility

- Protocol: OCPI 2.2.1-d2.
- SDK role: EMSP-side request methods only.
- Module loading: CommonJS output, regression-tested through both CommonJS `require` and ESM `import`.
- Runtime validation: CI and packed-package consumer tests currently run on Node.js 24. Older Node.js releases and browser bundlers are not yet part of the tested compatibility contract.

## Development

```sh
npm ci
npm run generate:client
npm test
npm run test:regression:pack
```

Generated SDK source and `api.md` must stay synchronized with the OpenAPI definition. Pull request CI rejects stale generated artifacts and validates the packed npm package from an isolated consumer project.

See [CONTRIBUTING.md](https://github.com/ThaddeusJiang/ocpi/blob/main/CONTRIBUTING.md) for the development workflow and [the dual-artifact maintenance spec](https://github.com/ThaddeusJiang/ocpi/blob/main/docs/specs/001-dual-artifact-maintenance.md) for the durable product contract.

## Release

Releases use GitHub Actions and npm Trusted Publishing. See [docs/releasing.md](https://github.com/ThaddeusJiang/ocpi/blob/main/docs/releasing.md) for the release checklist, version/tag contract, and publishing configuration.

## License

[Apache-2.0](LICENSE)
