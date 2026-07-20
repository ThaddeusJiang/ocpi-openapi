# Contributing

This repository maintains the complete OCPI OpenAPI definition and the EMSP-side `@thaddeusjiang/ocpi` TypeScript SDK as one product.

## Prerequisites

- Node.js 24, matching the current CI environment.
- npm with lockfile support.

Install the pinned dependencies from `package-lock.json`:

```sh
npm ci
```

## Sources and Generated Artifacts

Use these ownership rules when making changes:

| Path | Ownership |
| --- | --- |
| `openapi/` | Source of truth for the complete OCPI definition |
| `scripts/ems-client-operations.mjs` | Reviewed EMSP SDK boundary and SDK method naming |
| `src/generated/` | Committed generated SDK source; do not edit directly |
| `api.md` | Committed generated SDK API reference; do not edit directly |
| `docs/coverage.svg` | Committed public SDK coverage result |
| `dist/` | Ignored, reproducible build output |

The durable behavior is specified in [docs/specs/001-dual-artifact-maintenance.md](docs/specs/001-dual-artifact-maintenance.md).

## Change Workflow

1. Update the owning OpenAPI source, EMSP boundary, generator configuration, or test.
2. Regenerate the EMSP document, SDK, and API reference.
3. Run the smallest relevant validation while developing.
4. Run the complete validation before opening a pull request.
5. Commit every changed generated artifact with its source change.

Regenerate the TypeScript SDK and API reference:

```sh
npm run generate:client
```

Build every distributable artifact:

```sh
npm run build
```

## Validation

Run the complete OpenAPI, type, integration, and coverage validation:

```sh
npm test
```

Useful focused commands:

| Command | Purpose |
| --- | --- |
| `npm run test:openapi` | Lint the OpenAPI definition |
| `npm run test:integration` | Exercise every generated EMSP request method against Prism |
| `npm run typecheck` | Regenerate and type-check the SDK |
| `npm run pack:check` | Inspect the npm tarball contents |
| `npm run test:regression:pack` | Install the local tarball in an isolated TypeScript, CommonJS, and ESM consumer |
| `npm run test:regression:npm` | Run the consumer regression against a published package spec |

`test:regression:npm` uses `@thaddeusjiang/ocpi@next` by default. Override it with `OCPI_REGRESSION_PACKAGE`.

## Pull Requests

- Create a semantic branch such as `feat/...`, `fix/...`, or `docs/...`; do not implement changes directly on `main`.
- Use semantic commit and pull request titles.
- Keep dependencies pinned to exact stable versions.
- Do not change the package version on a feature branch.
- Explain any public OpenAPI, SDK method, type, or package export change.
- Confirm that generated source, `api.md`, and `docs/coverage.svg` are current.
- Include the relevant validation commands and results in the pull request description.

## Releases

Do not publish from a feature branch. Follow [docs/releasing.md](docs/releasing.md) after the intended changes have been merged.
