# OCPI OpenAPI Definition

![Generated client coverage](docs/coverage.svg)

OpenAPI 3.1 definitions for OCPI 2.2.1-d2, plus the generated EMS TypeScript client package `@thaddeusjiang/ocpi` and an OpenAPI-driven mock server for integration testing.

The OpenAPI definition is the source of truth for both the protocol reference and the published SDK. The generated [SDK API reference](api.md) lists the exact EMSP-side request surface.

## Install

```sh
npm ci
```

## Generate

```sh
npm run build
```

`npm run build` produces:

- `dist/yaml/openapi.yaml`: bundled OpenAPI document.
- `dist/yaml/openapi.ems.yaml`: bundled EMS client subset used for TypeScript client generation.
- `dist/dts/schema.d.ts`: OpenAPI TypeScript schema types.
- `src/generated`: generated TypeScript request client from `@hey-api/openapi-ts`.
- `api.md`: generated mapping between SDK methods and OpenAPI operations.

To regenerate only the TypeScript client:

```sh
npm run generate:client
```

To build the npm package output:

```sh
npm run build:package
```

## Mock Server

```sh
npm run mock
```

The mock server is generated from the bundled OpenAPI document with Prism and listens on `http://127.0.0.1:4010`.

## Test

```sh
npm test
```

The test command lints the OpenAPI definition, regenerates the TypeScript client, type-checks the generated code, starts a generated Prism mock server, runs every generated SDK operation against it, enforces 100% coverage for the generated public client surface, and updates `docs/coverage.svg`.

For only the generated client integration test:

```sh
npm run test:integration
```

For the npm package dry-run:

```sh
npm run pack:check
```

For npm install regression testing against the package built from this checkout, including TypeScript, CommonJS, and ESM consumers:

```sh
npm run test:regression:pack
```

For npm install regression testing against a published package:

```sh
npm run test:regression:npm
```

`test:regression:npm` installs `@thaddeusjiang/ocpi@next` by default. Override it with `OCPI_REGRESSION_PACKAGE`.

## Client Usage

After the package is published:

```sh
npm install @thaddeusjiang/ocpi
```

```ts
import { getVersions } from '@thaddeusjiang/ocpi';
import { client } from '@thaddeusjiang/ocpi/client';
import type { Credentials, Location } from '@thaddeusjiang/ocpi/types';

client.setConfig({
  baseUrl: 'https://ocpi.example.com/2.2.1',
  auth: 'Token your-ocpi-token',
});

const { data, error, response } = await getVersions();

if (error) {
  throw new Error(`OCPI request failed with status ${response?.status}`);
}

console.log(data.data);
```

The generated request client intentionally exposes only the EMSP-side operation surface. The complete OpenAPI bundle remains available as `@thaddeusjiang/ocpi/openapi.yaml`; the EMS client subset is available as `@thaddeusjiang/ocpi/openapi.ems.yaml`.

See [api.md](api.md) for every generated request method. Installed packages also expose it at `@thaddeusjiang/ocpi/api.md`.

## Maintenance Contract

Changes start in `openapi/`. `scripts/ems-client-operations.mjs` defines which OpenAPI operations belong to the EMSP SDK and records any generator naming differences. `npm run generate:client` then updates both `src/generated` and `api.md` from that contract.

Pull requests fail when generated code, the SDK API reference, or the coverage badge is stale. They also install the packed tarball into an isolated consumer project and verify TypeScript, CommonJS, ESM, public subpath exports, and the exact EMSP method boundary.

The durable behavior and acceptance criteria are documented in [the dual-artifact maintenance spec](docs/specs/001-dual-artifact-maintenance.md).

## Coverage

The previous 39.32% line coverage happened because Vitest counted the whole generated Hey API runtime, including internal fetch helpers, serializers, and SSE support that are not part of the OCPI request operation surface exercised by the integration test.

The badge now measures the generated public client surface:

- `src/generated/client.gen.ts`
- `src/generated/index.ts`
- `src/generated/sdk.gen.ts`

Vitest enforces 100% statements, branches, functions, and lines for those files.

## npm Publishing

`.github/workflows/publish-npm.yaml` publishes `@thaddeusjiang/ocpi` when a GitHub Release is published, or when the workflow is manually run with a release tag.

Release tags must match `package.json` version after removing an optional leading `v`, for example `v2.2.1-d2` matches `2.2.1-d2`.

Publishing uses npm Trusted Publishing with GitHub Actions OIDC:

- No `npm_token` or `NPM_TOKEN` is used.
- The workflow grants `id-token: write`.
- The publish command is `npm publish --access public --provenance --tag next`.
- `2.2.1-d2` is a prerelease version, so npm requires an explicit non-`latest` dist-tag. This package publishes it as `next`.
- Configure npm package Trusted Publisher with owner `ThaddeusJiang`, repository `ocpi`, workflow filename `publish-npm.yaml`, and allowed action `npm publish`.

Local terminal publishing cannot generate npm provenance because there is no supported CI/OIDC provider. If you need to publish locally, use `npm publish --access public --tag next` without `--provenance`.

See npm's Trusted Publishing documentation: https://docs.npmjs.com/trusted-publishers/

## GitHub Pages

The OpenAPI reference is deployed from `.github/workflows/pages.yaml`.
The workflow tests the OpenAPI definition and generated TypeScript client, builds the static Redoc page, and publishes it to GitHub Pages from the `main` branch.

## Nightly Regression

`.github/workflows/nightly-regression.yaml` runs every day at 03:00 Asia/Tokyo. By default it packs the current checkout, installs that tarball with `npm install`, validates the exact EMSP method set and every public file export in CommonJS and ESM, and type-checks imports from the root package, `@thaddeusjiang/ocpi/client`, and `@thaddeusjiang/ocpi/types`. The manual workflow input can point the same regression test at a published npm package spec.
