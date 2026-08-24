import assert from "node:assert/strict";
import test from "node:test";
import { createMessage } from "../src/index.ts";

test("createMessage returns a greeting", () => {
  assert.equal(createMessage("ts-config"), "Hello, ts-config!");
});
