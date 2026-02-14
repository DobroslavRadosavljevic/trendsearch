import { describe, expect, it } from "bun:test";

import { getTrends } from "../src";

describe("getTrends", () => {
  it("returns trends data for keyword", async () => {
    const result = await getTrends({ keyword: "typescript" });
    expect(result).toEqual({ keyword: "typescript", data: [] });
  });
});
