# Releasing `@thaddeusjiang/ocpi`

The npm package is published from GitHub Actions with npm Trusted Publishing. A GitHub Release or a manual workflow dispatch selects the exact tag to publish.

## Release Contract

- The release tag must equal the `package.json` version with an optional leading `v`.
- Package version changes happen directly on `main` as a dedicated version and release-metadata change, not on feature branches.
- `.github/workflows/publish-npm.yaml` currently publishes with the npm `next` dist-tag.
- CI publishing uses OpenID Connect provenance and does not use `npm_token` or `NPM_TOKEN`.
- A release must not proceed until configuration, environment, deployment, runtime, and workflow changes have been reviewed and explicitly approved.

For example, tag `v2.2.1-d2` matches package version `2.2.1-d2`.

## Checklist

1. Merge the intended feature and fix pull requests into `main`.
2. Review all release-impacting configuration, runtime, deployment, and workflow changes.
3. On `main`, update the package version and associated package metadata in a dedicated semantic commit.
4. Install and validate the exact lockfile state:

   ```sh
   npm ci
   npm test
   npm run pack:check
   npm run test:regression:pack
   ```

5. Create a GitHub Release whose tag matches the package version.
6. Confirm that the `Publish generated client to npm` workflow succeeds.
7. Run the published-package regression against the released version:

   ```sh
   OCPI_REGRESSION_PACKAGE='@thaddeusjiang/ocpi@2.2.1-d2' npm run test:regression:npm
   ```

The release workflow can also be started manually with a matching tag through `workflow_dispatch`.

## Trusted Publisher Configuration

Configure the npm package Trusted Publisher with:

- Owner: `ThaddeusJiang`
- Repository: `ocpi`
- Workflow filename: `publish-npm.yaml`
- Allowed action: `npm publish`

The workflow grants `id-token: write` and publishes with:

```sh
npm publish --access public --provenance --tag next
```

See the [npm Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/).

## Local Publishing

Local environments do not have the GitHub Actions OpenID Connect provider required for npm provenance. If an explicitly approved emergency requires local publishing, omit `--provenance`:

```sh
npm publish --access public --tag next
```

Normal releases must use the GitHub Actions workflow.
