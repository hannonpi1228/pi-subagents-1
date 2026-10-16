/**
 * agent-tool-exposure.test.ts — `SubagentsSettings.toolExposure` gates the
 * `Agent` tool's declared `exposure`.
 *
 * The whole point of the setting is token cost: a diagnosis of Pi's per-turn
 * tool-definitions payload found `Agent`'s nested schema (`acceptance`,
 * `preflight`, `lane`, `control`, `workflow`, and more) to be the single
 * largest contributor, declared on every turn whether or not it is called.
 * `exposure: "deferred"` stops that declaration by default and lets pi's
 * `tool_search` extension find and declare it only on the turn it is
 * actually relevant — so this test asserts the registered tool's `exposure`
 * field, not any runtime behavior change (there is none: `deferred` tools
 * stay fully callable, see pi's `ToolExposure` docs).
 */
import { afterEach, describe, expect, it } from "vitest";
import subagentsExtension from "../src/index.js";
import { hermeticDir, makePi } from "./helpers/boot-extension.js";

let hermetic: ReturnType<typeof hermeticDir> | undefined;

afterEach(() => {
  hermetic?.restore();
  hermetic = undefined;
});

describe("Agent tool exposure", () => {
  it("defaults to direct — unchanged behavior for anyone who does not opt in", () => {
    hermetic = hermeticDir({ settings: { schedulingEnabled: false } });
    const { pi, tools } = makePi();
    subagentsExtension(pi);

    expect(tools.get("Agent")?.exposure).toBe("direct");
  });

  it('"deferred" in subagents.json sets the Agent tool\'s exposure to deferred', () => {
    hermetic = hermeticDir({ settings: { schedulingEnabled: false, toolExposure: "deferred" } });
    const { pi, tools } = makePi();
    subagentsExtension(pi);

    expect(tools.get("Agent")?.exposure).toBe("deferred");
  });

  it("rejects an unrecognized value by falling back to direct", () => {
    hermetic = hermeticDir({ settings: { schedulingEnabled: false, toolExposure: "nonsense" } });
    const { pi, tools } = makePi();
    subagentsExtension(pi);

    expect(tools.get("Agent")?.exposure).toBe("direct");
  });
});
