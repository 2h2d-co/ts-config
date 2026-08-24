# Project TypeScript settings review

## Scope

This review covers the canonical TypeScript configurations in 2h2d projects and project templates.
It explicitly excludes `pi-researcher`.

Generated playgrounds, vendored reference trees, and test fixtures are not independent projects, so
their embedded configurations are also outside this policy review:

- `new/.new-playground/`
- `pi-openai-codex-compat/.reference/`
- `vscode-node-tests/references/`

## Common configuration

[`base.json`](base.json) contains portable compiler policy:

| Area                          | Settings                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Type safety                   | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`                           |
| Control flow and declarations | `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `allowUnreachableCode: false`, `allowUnusedLabels: false` |
| Portable syntax and modules   | `erasableSyntaxOnly`, `isolatedModules`, `verbatimModuleSyntax`, `moduleDetection: "force"`, `noUncheckedSideEffectImports`        |
| TypeScript import paths       | `allowImportingTsExtensions`, `rewriteRelativeImportExtensions`                                                                    |
| Build safety                  | `noEmitOnError`, `forceConsistentCasingInFileNames`                                                                                |

## Settings left in each project

The common configuration deliberately does not own runtime targets, module resolvers, ambient
types, emit behavior, library checking, framework behavior, path aliases, or source selection.

| Project                      | Environment and checking left local                                                                                                                                                     | Build and source settings left local                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `exa-search-cli`             | `module: NodeNext`, `target/lib: ESNext`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Root include list; build disables declarations and emits `src` to `dist`                         |
| `new`                        | `module: NodeNext`, `target/lib: ESNext`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Root include list; build disables declarations and emits `src` to `dist`                         |
| `oxlint-config`              | `module: NodeNext`, `target/lib: ESNext`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Root include list; build emits declarations and JavaScript from `src` to `dist`                  |
| `parallel-search-cli`        | `module: NodeNext`, `target/lib: ESNext`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Root include list; build disables declarations and emits `src` to `dist`                         |
| `pi-dont-change-my-defaults` | `module: NodeNext`, `target/lib: ES2023`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Project include list; no separate build config                                                   |
| `pi-openai-codex-compat`     | `module: NodeNext`, `target/lib: ES2023`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Project include list; no separate build config                                                   |
| `pi-openai-codex-fast`       | `module: NodeNext`, `target/lib: ES2023`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Root include list; build disables declarations and emits `index.ts` to `dist`                    |
| `pi-reviewer`                | `module: ESNext`, `moduleResolution: bundler`, `noEmit`, `skipLibCheck`; package-specific ES2022/ES2023 and DOM libraries, Node/Vite/VS Code types, JSX, JSON modules, and path aliases | Per-package `files`, `include`, and `exclude`                                                    |
| `pi-system-prompt-patcher`   | `module: NodeNext`, `target/lib: ES2023`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Project include list; no separate build config                                                   |
| `tree-sitter-wasms`          | `module: NodeNext`, `target/lib: ESNext`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Root include list; build emits declarations and JavaScript from `src` to `dist`                  |
| `vscode-node-tests`          | `module/moduleResolution: NodeNext`, `target: ES2022`, `lib: ES2024`, `skipLibCheck: false`, unused-local and unused-parameter checks; child-specific Node and VS Code types            | Extension output paths, declarations, source maps, script-only `noEmit`, and per-config includes |
| `templates/pi-extension`     | `module: NodeNext`, `target/lib: ES2023`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Template include list                                                                            |
| `templates/ts`               | `module: NodeNext`, `target/lib: ESNext`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Template include list; build emits declarations and JavaScript from `src` to `dist`              |
| `templates/ts-cli`           | `module: NodeNext`, `target/lib: ESNext`, Node types, `noEmit`, `skipLibCheck`                                                                                                          | Template include list; build disables declarations and emits `src` to `dist`                     |

## Adoption differences requiring review

Most projects already enable every option in `base.json`; adopting the package removes duplication
without changing their effective compiler options.

Two projects have effective changes to review before rollout:

- `pi-reviewer` would additionally enable `erasableSyntaxOnly`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`,
  `noUncheckedIndexedAccess`, `rewriteRelativeImportExtensions`, and `verbatimModuleSyntax`.
- `vscode-node-tests` would additionally enable `moduleDetection: "force"` and
  `noUncheckedSideEffectImports`.

`skipLibCheck` remains local because `vscode-node-tests` intentionally uses `false` while the other
reviewed roots use `true`. `noUnusedLocals` and `noUnusedParameters` remain local because only
`vscode-node-tests` enables them.

### Read-only adoption validation

Both `vscode-node-tests` configurations pass with `moduleDetection: "force"` and
`noUncheckedSideEffectImports`, so its adoption does not require source changes.

All ten reviewed `pi-reviewer` configurations pass with their current settings. Testing each
additional common option independently produced:

| Added option                         | Diagnostic occurrences | Failing configs |
| ------------------------------------ | ---------------------: | --------------: |
| `erasableSyntaxOnly`                 |                     14 |               7 |
| `exactOptionalPropertyTypes`         |                    967 |               8 |
| `noImplicitOverride`                 |                     11 |               5 |
| `noImplicitReturns`                  |                      6 |               4 |
| `noPropertyAccessFromIndexSignature` |                  1,080 |               9 |
| `noUncheckedIndexedAccess`           |                  1,739 |               8 |
| `rewriteRelativeImportExtensions`    |                      0 |               0 |
| `verbatimModuleSyntax`               |                    116 |               5 |

The `pi-reviewer` configurations overlap heavily, so these are repeated diagnostic occurrences
across configuration runs, not counts of unique source locations. The result still shows that
`pi-reviewer` cannot adopt the complete common policy as a dependency-only migration.
