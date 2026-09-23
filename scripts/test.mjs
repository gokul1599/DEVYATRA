/* Cross-platform test runner. Sets the react-server condition so server-only
 * modules (google client, cache, discovery engine) can be imported under
 * node:test, then delegates to the tsx CLI the same way `tsx --test` did. */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

process.env.NODE_ENV = "test";

const existing = process.env.NODE_OPTIONS ?? "";
if (!existing.includes("react-server")) {
  process.env.NODE_OPTIONS = [existing, "--conditions=react-server", "--no-warnings"].filter(Boolean).join(" ");
}

const require = createRequire(import.meta.url);
const cli = require.resolve("tsx/cli");
const r = spawnSync(process.execPath, [cli, "--test", "tests/*.test.ts"], {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "test" },
});
process.exit(r.status === null ? 1 : r.status);