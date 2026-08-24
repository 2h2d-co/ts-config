# Project TypeScript settings review

## Scope

This review covers the canonical TypeScript configurations in 2h2d projects and project templates.
It explicitly excludes `pi-researcher` and `pi-reviewer`.

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
| Compiler operation            | `noEmit`, `skipLibCheck`                                                                                                           |
| Build safety                  | `noEmitOnError`, `forceConsistentCasingInFileNames`                                                                                |

## Settings left in each project

The common configuration deliberately does not own runtime targets, module resolvers, ambient
types, emitting-build details, framework behavior, path aliases, or source selection.

| Project                      | Environment and checking left local                                                                                                                   | Build and source settings left local                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `exa-search-cli`             | `module: NodeNext`, `target/lib: ESNext`, Node types                                                                                                  | Root include list; build disables declarations and sets `noEmit: false` to emit `src` to `dist`                           |
| `new`                        | `module: NodeNext`, `target/lib: ESNext`, Node types                                                                                                  | Root include list; build disables declarations and sets `noEmit: false` to emit `src` to `dist`                           |
| `oxlint-config`              | `module: NodeNext`, `target/lib: ESNext`, Node types                                                                                                  | Root include list; build sets `noEmit: false` to emit declarations and JavaScript from `src` to `dist`                    |
| `parallel-search-cli`        | `module: NodeNext`, `target/lib: ESNext`, Node types                                                                                                  | Root include list; build disables declarations and sets `noEmit: false` to emit `src` to `dist`                           |
| `pi-dont-change-my-defaults` | `module: NodeNext`, `target/lib: ES2023`, Node types                                                                                                  | Project include list; no separate emitting config                                                                         |
| `pi-openai-codex-compat`     | `module: NodeNext`, `target/lib: ES2023`, Node types                                                                                                  | Project include list; no separate emitting config                                                                         |
| `pi-openai-codex-fast`       | `module: NodeNext`, `target/lib: ES2023`, Node types                                                                                                  | Root include list; build disables declarations and sets `noEmit: false` to emit `index.ts` to `dist`                      |
| `pi-system-prompt-patcher`   | `module: NodeNext`, `target/lib: ES2023`, Node types                                                                                                  | Project include list; no separate emitting config                                                                         |
| `tree-sitter-wasms`          | `module: NodeNext`, `target/lib: ESNext`, Node types                                                                                                  | Root include list; build sets `noEmit: false` to emit declarations and JavaScript from `src` to `dist`                    |
| `vscode-node-tests`          | `module/moduleResolution: NodeNext`, `target: ES2022`, `lib: ES2024`, unused-local and unused-parameter checks; child-specific Node and VS Code types | Extension config sets `noEmit: false` with output paths, declarations, and source maps; scripts retain inherited `noEmit` |
| `templates/pi-extension`     | `module: NodeNext`, `target/lib: ES2023`, Node types                                                                                                  | Template include list                                                                                                     |
| `templates/ts`               | `module: NodeNext`, `target/lib: ESNext`, Node types                                                                                                  | Template include list; build sets `noEmit: false` to emit declarations and JavaScript from `src` to `dist`                |
| `templates/ts-cli`           | `module: NodeNext`, `target/lib: ESNext`, Node types                                                                                                  | Template include list; build disables declarations and sets `noEmit: false` to emit `src` to `dist`                       |

## Adoption differences requiring review

Most projects already enable every option in `base.json`; adopting the package removes duplication
without changing their effective compiler options. `vscode-node-tests` would enable
`moduleDetection: "force"`, `noUncheckedSideEffectImports`, and `skipLibCheck`; its emitting config
must explicitly set `noEmit: false`. `noUnusedLocals` and `noUnusedParameters` remain local because
only `vscode-node-tests` enables them.

### Read-only adoption validation

Both `vscode-node-tests` configurations pass with `moduleDetection: "force"`,
`noUncheckedSideEffectImports`, and `skipLibCheck`. Its adoption requires only the explicit
`noEmit: false` configuration change, not source changes.
