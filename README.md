# @2h2d/ts-config

Shared TypeScript compiler policy for 2h2d repositories.

## Install

```bash
npm install --save-dev --save-exact @2h2d/ts-config typescript@7.0.2
```

## Use

Keep environment, source-selection, and build settings in the consuming project:

```json
{
  "extends": "@2h2d/ts-config/base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "target": "ES2023",
    "lib": ["ES2023"],
    "types": ["node"]
  },
  "include": ["src", "test", "scripts", "oxlint.config.ts"]
}
```

## Common policy

`base.json` centralizes:

- strict type checking, unchecked indexed-access protection, and exact optional properties;
- explicit return, override, switch-fallthrough, index-signature, unreachable-code, and unused-label
  checks;
- erasable TypeScript syntax, isolated modules, verbatim module syntax, forced module detection, and
  checked side-effect imports;
- TypeScript-extension imports and relative import-extension rewriting;
- type-check-only operation by default, dependency declaration-file skipping, casing consistency,
  and prevention of JavaScript emission after a type error.

See [`base.json`](base.json) for the authoritative settings.

## Intentionally project-local settings

The package does not prescribe:

- runtime and resolver selection: `module`, `moduleResolution`, `target`, and `lib`;
- ambient environments: `types`;
- emitting-build details: declarations, source maps, output paths, and an explicit
  `noEmit: false`;
- source selection: `files`, `include`, `exclude`, and project references;
- framework behavior: JSX, JSON modules, and path aliases;
- unused local and parameter reporting.

Relative paths in inherited TypeScript configurations resolve relative to the configuration that
declares them. Keeping path-bearing settings in consumers avoids accidentally resolving them from
this package inside `node_modules`.

The current project inventory and adoption differences are recorded in
[`PROJECT-SETTINGS.md`](https://github.com/2h2d-co/ts-config/blob/main/PROJECT-SETTINGS.md).

## Development

```bash
npm install
npm run check
npm test
npm run build
npm run pack:dry
```

## Packaging

`.github/npm-package-files` is the authoritative package-content allowlist used by the local release
command and both CI jobs. Update it whenever the intended published file set changes.

## Release staging

Repository setup:

1. When `new` creates the GitHub repository, it automatically protects `main` and `v*` tags and
   restricts `npm-publish` to `v*` tags without a deployment reviewer or administrator bypass.
2. Configure npm trusted publishing for `2h2d-co/ts-config` using
   `.github/workflows/publish.yml` and the `npm-publish` environment.
3. Replace `.github/release-signers` if release commits use a different SSH signing key.

If repository creation was skipped with `--no-github`, configure the branch, tag, and environment
controls manually.

Release flow:

1. Run `npm run release -- X.Y.Z` from a clean, synchronized `main`.
2. The release command builds the package from the staged Git index, records its SHA-256 in the
   SSH-signed release commit, rebuilds the commit to prove reproducibility, and creates a lightweight
   `vX.Y.Z` tag.
3. Inspect the commit and tag, then push them atomically with
   `git push --atomic origin main vX.Y.Z`.
4. A read-only CI job builds, tests, packs, and inspects the package without publishing credentials.
5. A separate credentialed job verifies the signed commit and exact package digest before attesting
   and staging that archive through npm trusted publishing.
6. Approve the staged package on npmjs.com or with `npm stage approve <stage-id>`.

Stable versions use `latest`; prereleases derive a non-`latest` dist-tag such as `alpha`, `beta`, or
`rc` from their first prerelease identifier.
