# 001 Dual-Artifact Maintenance

The repository maintains the OCPI OpenAPI definition and the `@thaddeusjiang/ocpi` TypeScript SDK as one product.

Status: Accepted

## Purpose

Keep the protocol definition, EMSP SDK surface, user-facing API reference, package contents, and validation gates synchronized from one reviewable contract.

## Scope

- In scope:
  - The complete OCPI 2.2.1-d2 OpenAPI definition.
  - The EMSP-side TypeScript request client.
  - Generated SDK API documentation.
  - npm package exports and consumer compatibility.
  - CI drift and package regression gates.
- Out of scope:
  - A CPO-side SDK.
  - Handwritten business-domain abstractions over OCPI.
  - Native ESM build output.
  - Automatic package version selection or release creation.

## Persistence

The feature has no runtime persistence. Durable state is stored in Git with these ownership rules:

- `openapi/` owns the complete protocol definition and is the primary source of truth.
- `scripts/ems-client-operations.mjs` owns the reviewed EMSP SDK boundary and maps OpenAPI operation IDs to generated SDK method names.
- `src/generated/` is committed derived SDK source.
- `api.md` is the committed derived SDK API reference.
- `docs/coverage.svg` is the committed derived public-surface coverage result.
- `dist/` contains ignored build artifacts and must be reproducible from the durable sources.

Generated files must not be edited as independent sources. A change to generated behavior starts in `openapi/`, the EMSP boundary contract, or generator configuration.

Repository metadata, examples, and test fixtures must use vendor-neutral project and example identities.

## Relationships

- The complete OpenAPI document produces the published `openapi.yaml` export and static protocol documentation.
- The EMSP boundary filters the complete document into `openapi.ems.yaml`.
- The EMSP document produces both the TypeScript client and `api.md`.
- The package publishes the generated client, both OpenAPI documents, and the SDK API reference together.

## Behavior

### Generation

1. Bundle `openapi/openapi.yaml` into the complete OpenAPI document.
2. Filter it to the reviewed EMSP operation set.
3. Fail if the filtered operation set differs from the declared EMSP contract.
4. Generate the TypeScript client and SDK API reference from the same filtered document.
5. Build the package without modifying its version outside the release workflow.

### Public package contract

- The root export exposes exactly the declared EMSP request methods and their TypeScript types.
- `/client` exposes generated client configuration.
- `/types` exposes generated OCPI types.
- `/openapi.yaml` exposes the complete protocol document.
- `/openapi.ems.yaml` exposes the SDK input document.
- `/api.md` exposes the generated SDK API reference.
- CommonJS and ESM consumers can load the runtime package.

### Validation

Every pull request must verify:

- OpenAPI linting.
- SDK generation and TypeScript type checking.
- Public request-surface integration coverage.
- Committed generated-code, API-reference, and coverage-badge freshness.
- Package construction.
- Installation and type checking from the packed tarball.
- CommonJS and ESM runtime loading.
- Exact EMSP request-method and public-subpath boundaries.

The scheduled regression repeats the packed-package consumer checks from the default branch or tests an explicitly selected published package.

## Search

Not applicable.

## AI

Not applicable.

## Cross-Spec Links

- No other feature specs currently exist.

## Open Questions

- Native ESM output may be added when a package build change can preserve existing CommonJS consumers and is covered by an ecosystem compatibility matrix.
