import { describe, expect, it } from "bun:test";

import {
  completeWords,
  renderCompletionScript,
} from "../../src/cli/completion";

describe("cli completion", () => {
  it("returns top-level command suggestions", () => {
    const suggestions = completeWords({
      words: [],
      hasTrailingSpace: true,
    });

    expect(suggestions).toContain("autocomplete");
    expect(suggestions).toContain("config");
    expect(suggestions).toContain("experimental");
  });

  it("returns nested experimental subcommands", () => {
    const suggestions = completeWords({
      words: ["experimental"],
      hasTrailingSpace: true,
    });

    expect(suggestions).toContain("trending-now");
    expect(suggestions).toContain("trending-articles");
    expect(suggestions).toContain("geo-picker");
    expect(suggestions).toContain("category-picker");
  });

  it("returns flag suggestions for a resolved command", () => {
    const suggestions = completeWords({
      words: ["autocomplete", "--o"],
      hasTrailingSpace: false,
    });

    expect(suggestions).toContain("--output");
  });

  it("renders completion scripts for bash/zsh/fish", () => {
    const bash = renderCompletionScript("bash", "gtrends");
    const zsh = renderCompletionScript("zsh", "gtrends");
    const fish = renderCompletionScript("fish", "gtrends");

    expect(bash).toContain("gtrends __complete");
    expect(zsh).toContain("gtrends __complete");
    expect(fish).toContain("gtrends __complete");
  });

  it("returns undefined for unsupported shell", () => {
    expect(renderCompletionScript("powershell", "gtrends")).toBeUndefined();
  });
});
