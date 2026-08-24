import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseConfigPath = join(root, "base.json");
const projectLocalCompilerOptions = [
  "baseUrl",
  "declaration",
  "emitDeclarationOnly",
  "jsx",
  "lib",
  "module",
  "moduleResolution",
  "noEmit",
  "noUnusedLocals",
  "noUnusedParameters",
  "outDir",
  "paths",
  "rootDir",
  "skipLibCheck",
  "sourceMap",
  "target",
  "types",
] as const;

test("base config contains only portable compiler policy", async () => {
  const parsed: unknown = JSON.parse(await readFile(baseConfigPath, "utf8"));
  assert.ok(isRecord(parsed));
  assert.deepEqual(Object.keys(parsed), ["compilerOptions"]);

  const compilerOptions = parsed["compilerOptions"];
  assert.ok(isRecord(compilerOptions));
  for (const option of projectLocalCompilerOptions) {
    assert.equal(option in compilerOptions, false, `${option} must remain project-local`);
  }
});

test("TypeScript resolves the published package path and local overrides", async (context) => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "ts-config-test-"));
  context.after(async () => {
    await rm(temporaryDirectory, { force: true, recursive: true });
  });

  const packageScope = join(temporaryDirectory, "node_modules", "@2h2d");
  await mkdir(packageScope, { recursive: true });
  await symlink(root, join(packageScope, "ts-config"), "dir");
  await writeFile(
    join(temporaryDirectory, "package.json"),
    `${JSON.stringify({ type: "module" }, undefined, 2)}\n`,
  );
  await writeFile(
    join(temporaryDirectory, "tsconfig.json"),
    `${JSON.stringify(
      {
        extends: "@2h2d/ts-config/base.json",
        compilerOptions: {
          lib: ["ES2023"],
          module: "NodeNext",
          noEmit: true,
          target: "ES2023",
          types: [],
        },
        files: ["index.ts"],
      },
      undefined,
      2,
    )}\n`,
  );
  await writeFile(join(temporaryDirectory, "index.ts"), "export const value: string = 'value';\n");

  const tscPath = join(root, "node_modules", "typescript", "bin", "tsc");
  const compile = spawnSync(process.execPath, [tscPath, "--project", temporaryDirectory], {
    encoding: "utf8",
  });
  assert.equal(compile.status, 0, compile.stderr);

  const showConfig = spawnSync(
    process.execPath,
    [tscPath, "--project", temporaryDirectory, "--showConfig"],
    { encoding: "utf8" },
  );
  assert.equal(showConfig.status, 0, showConfig.stderr);

  const parsed: unknown = JSON.parse(showConfig.stdout);
  assert.ok(isRecord(parsed));
  const compilerOptions = parsed["compilerOptions"];
  assert.ok(isRecord(compilerOptions));
  assert.equal(compilerOptions["strict"], true);
  assert.equal(compilerOptions["erasableSyntaxOnly"], true);
  assert.equal(compilerOptions["target"], "es2023");
  assert.equal(compilerOptions["module"], "nodenext");
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
